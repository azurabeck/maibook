import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import { BookMarked, Bold as BoldIcon, Check, Italic as ItalicIcon, LoaderCircle, SpellCheck } from 'lucide-react'
import { parseInline, serializeInline, type TextRun } from '@/utils/inlineFormat'
import { chapterTextEditorCss as css } from './css'

// #region Conversão texto do capítulo <-> documento do Tiptap
// O capítulo continua salvo como texto simples com marcações
// (**negrito**, *itálico*) — ver utils/inlineFormat.ts. O editor
// só existe na tela: cada linha do texto vira um parágrafo e as
// marcações viram negrito/itálico de verdade, e na volta o inverso.
// Por isso o schema do editor só tem parágrafo + negrito + itálico:
// qualquer outra coisa colada (título, lista...) vira parágrafo comum.
export function contentToDoc(content: string): JSONContent {
  return {
    type: 'doc',
    content: content.replace(/\r/g, '').split('\n').map((line) => {
      const runs = parseInline(line)
      return runs.length
        ? {
            type: 'paragraph',
            content: runs.map((run) => ({
              type: 'text',
              text: run.text,
              marks: [
                ...(run.bold ? [{ type: 'bold' }] : []),
                ...(run.italic ? [{ type: 'italic' }] : []),
              ],
            })),
          }
        : { type: 'paragraph' }
    }),
  }
}

export function docToContent(editor: Editor): string {
  const lines: string[] = []
  editor.state.doc.forEach((paragraph) => {
    const runs: TextRun[] = []
    paragraph.forEach((node) => {
      runs.push({
        text: node.text ?? '',
        bold: node.marks.some((mark) => mark.type.name === 'bold'),
        italic: node.marks.some((mark) => mark.type.name === 'italic'),
      })
    })
    lines.push(serializeInline(runs))
  })
  return lines.join('\n')
}
// #endregion

interface ChapterTextEditorProps {
  content: string
  // true enquanto uma edição local ainda não foi gravada no Firestore:
  // nesse meio-tempo, um snapshot com o texto antigo não pode
  // sobrescrever o que acabou de ser digitado
  savePending: boolean
  onChange: (content: string) => void
  // entrega a instância do editor pra quem precisa agir sobre o texto
  // (busca, aplicar revisão da IA) — null ao desmontar
  onReady?: (editor: Editor | null) => void
  className?: string
  style?: CSSProperties
  placeholder?: string
  // Clique com o botão direito numa palavra (ou num trecho selecionado)
  // oferece "Adicionar ao Glossário"; `context` é o parágrafo em volta
  onAddToGlossary?: (term: string, context: string) => void
  // Correção ortográfica no mesmo menu (só pra uma palavra)
  onCheckSpelling?: (word: string, context: string) => Promise<{ correct: boolean; suggestions: string[] }>
}

// #region Palavra/trecho sob o clique direito
// letras (com acento), números, apóstrofo e hífen fazem parte da palavra
const WORD_CHAR = /[\p{L}\p{N}'’-]/u
// seleções maiores que isso não viram termo de glossário (aí o menu
// normal do navegador aparece)
const MAX_TERM_LENGTH = 60

interface WordMenuState {
  x: number
  y: number
  term: string
  context: string
  from: number // trecho no documento (pra trocar pela correção)
  to: number
  // ortografia: undefined = não se aplica (trecho com várias palavras)
  spelling?: { status: 'checking' } | { status: 'done'; correct: boolean; suggestions: string[] } | { status: 'error' }
}

type WordUnderPointer = Pick<WordMenuState, 'term' | 'context' | 'from' | 'to'>

function termUnderPointer(editor: Editor, event: ReactMouseEvent): WordUnderPointer | null {
  const { state, view } = editor
  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
  if (!coords) return null
  const $pos = state.doc.resolve(coords.pos)
  const paragraph = $pos.parent.textContent

  // clicou dentro de uma seleção: usa o trecho selecionado
  const { from, to, empty } = state.selection
  if (!empty && coords.pos >= from && coords.pos <= to) {
    const term = state.doc.textBetween(from, to, ' ').replace(/\s+/g, ' ').trim()
    return term && term.length <= MAX_TERM_LENGTH ? { term, context: paragraph, from, to } : null
  }

  // senão, a palavra inteira embaixo do cursor (e ela fica selecionada)
  const offset = $pos.parentOffset
  let start = offset
  let end = offset
  while (start > 0 && WORD_CHAR.test(paragraph[start - 1])) start -= 1
  while (end < paragraph.length && WORD_CHAR.test(paragraph[end])) end += 1
  // apóstrofo/hífen soltos nas pontas não fazem parte da palavra
  while (start < end && /['’-]/.test(paragraph[start])) start += 1
  while (end > start && /['’-]/.test(paragraph[end - 1])) end -= 1
  const term = paragraph.slice(start, end)
  if (!term) return null

  const paragraphStart = $pos.start()
  const range = { from: paragraphStart + start, to: paragraphStart + end }
  editor.commands.setTextSelection(range)
  return { term, context: paragraph, ...range }
}

// uma palavra só (sem espaço), com pelo menos uma letra
const isSingleWord = (term: string) => !/\s/.test(term) && /\p{L}/u.test(term)
// #endregion

// Editor do texto do capítulo, com negrito e itálico visíveis.
// Atalhos: Ctrl+B / Ctrl+I, os botões da barrinha, ou digitar
// **assim** / *assim* (vira formatação ao fechar a marcação).
// Quem usa deve montar um por capítulo (key={chapter.id}) pra o
// desfazer (Ctrl+Z) não atravessar de um capítulo pro outro.
export function ChapterTextEditor({
  content,
  savePending,
  onChange,
  onReady,
  className,
  style,
  placeholder = 'Comece a escrever...',
  onAddToGlossary,
  onCheckSpelling,
}: ChapterTextEditorProps) {
  const [glossaryMenu, setGlossaryMenu] = useState<WordMenuState | null>(null)
  const glossaryMenuRef = useRef<HTMLDivElement>(null)
  // ignora a resposta da ortografia de um clique direito antigo
  const spellingRequestRef = useRef(0)

  // fecha o menu ao clicar fora, rolar ou apertar Esc
  useEffect(() => {
    if (!glossaryMenu) return
    const close = (event: Event) => {
      if (event.type === 'mousedown' && glossaryMenuRef.current?.contains(event.target as Node)) return
      setGlossaryMenu(null)
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setGlossaryMenu(null) }
    document.addEventListener('mousedown', close)
    document.addEventListener('scroll', close, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('scroll', close, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [glossaryMenu])

  // último texto que o próprio editor mandou pra fora — se o `content`
  // que chega for igual, não é mudança externa
  const lastEmittedRef = useRef(content)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      UndoRedo,
      Placeholder.configure({ placeholder }),
    ],
    content: contentToDoc(content),
    onUpdate: ({ editor: current }) => {
      const next = docToContent(current)
      lastEmittedRef.current = next
      onChangeRef.current(next)
    },
  })

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
    }),
  })

  useEffect(() => {
    onReady?.(editor)
    return () => onReady?.(null)
  }, [editor, onReady])

  // texto mudou por fora (outro dispositivo, etc.) -> atualiza o editor
  useEffect(() => {
    if (!editor || savePending || content === lastEmittedRef.current) return
    lastEmittedRef.current = content
    editor.commands.setContent(contentToDoc(content), { emitUpdate: false })
  }, [editor, content, savePending])

  function handleContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    if (!editor || (!onAddToGlossary && !onCheckSpelling)) return
    const found = termUnderPointer(editor, event)
    if (!found) return // fora de uma palavra: menu normal do navegador
    event.preventDefault()

    const checkSpelling = onCheckSpelling && isSingleWord(found.term)
    const requestId = ++spellingRequestRef.current
    setGlossaryMenu({ ...found, x: event.clientX, y: event.clientY, spelling: checkSpelling ? { status: 'checking' } : undefined })
    if (!checkSpelling) return

    onCheckSpelling(found.term, found.context)
      .then(({ correct, suggestions }) => {
        if (requestId !== spellingRequestRef.current) return
        setGlossaryMenu((current) => (current ? { ...current, spelling: { status: 'done', correct, suggestions } } : current))
      })
      .catch((error) => {
        console.error('Falha ao verificar ortografia:', error)
        if (requestId !== spellingRequestRef.current) return
        setGlossaryMenu((current) => (current ? { ...current, spelling: { status: 'error' } } : current))
      })
  }

  // troca a palavra pela correção, mantendo negrito/itálico dela
  function applySuggestion(menu: WordMenuState, suggestion: string) {
    editor?.chain().focus().command(({ tr }) => {
      tr.insertText(suggestion, menu.from, menu.to)
      return true
    }).run()
    setGlossaryMenu(null)
  }

  return (
    <div className={css.root}>
      <div className={css.toolbar} role="toolbar" aria-label="Formatação do texto">
        <button
          type="button"
          className={active?.bold ? css.buttonActive : css.button}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-pressed={active?.bold}
          title="Negrito (Ctrl+B)"
        >
          <BoldIcon size={14} />
        </button>
        <button
          type="button"
          className={active?.italic ? css.buttonActive : css.button}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-pressed={active?.italic}
          title="Itálico (Ctrl+I)"
        >
          <ItalicIcon size={14} />
        </button>
        <span className={css.hint}>Ctrl+B · Ctrl+I · ou digite **negrito** e *itálico*</span>
      </div>

      <div
        className={`${css.scroller} ${className ?? ''}`}
        style={style}
        // clicar na área vazia abaixo do texto também foca o editor
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault()
            editor?.commands.focus('end')
          }
        }}
        onContextMenu={handleContextMenu}
      >
        <EditorContent editor={editor} className={css.content} />
      </div>

      {glossaryMenu && (
        <div
          ref={glossaryMenuRef}
          className={css.contextMenu}
          style={{ left: glossaryMenu.x, top: glossaryMenu.y }}
          role="menu"
        >
          {/* #region Ortografia (sugestões da IA) */}
          {glossaryMenu.spelling?.status === 'checking' && (
            // só aparece se demorar (dicionário ainda carregando) — senão o
            // resultado chega antes e o aviso nem pisca
            <p className={`${css.contextMenuNote} ${css.contextMenuNoteDelayed}`}><LoaderCircle size={13} className={css.spinner} /> Carregando o dicionário...</p>
          )}
          {glossaryMenu.spelling?.status === 'done' && glossaryMenu.spelling.suggestions.map((suggestion) => (
            <button key={suggestion} type="button" role="menuitem" className={css.suggestion} onClick={() => applySuggestion(glossaryMenu, suggestion)}>
              <SpellCheck size={14} />
              <span><strong>{suggestion}</strong></span>
            </button>
          ))}
          {glossaryMenu.spelling?.status === 'done' && glossaryMenu.spelling.correct && (
            <p className={css.contextMenuNote}><Check size={13} /> Ortografia correta</p>
          )}
          {glossaryMenu.spelling?.status === 'done' && !glossaryMenu.spelling.correct && glossaryMenu.spelling.suggestions.length === 0 && (
            <p className={css.contextMenuNote}>Palavra fora do dicionário, sem sugestões.</p>
          )}
          {glossaryMenu.spelling?.status === 'error' && (
            <p className={css.contextMenuNote}>Não foi possível verificar a ortografia.</p>
          )}
          {glossaryMenu.spelling && onAddToGlossary && <hr className={css.contextMenuDivider} />}
          {/* #endregion */}

          {onAddToGlossary && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onAddToGlossary(glossaryMenu.term, glossaryMenu.context)
                setGlossaryMenu(null)
              }}
            >
              <BookMarked size={14} />
              <span>Adicionar <strong>“{glossaryMenu.term}”</strong> ao Glossário</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
