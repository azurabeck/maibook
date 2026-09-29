import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import { Bold as BoldIcon, Italic as ItalicIcon } from 'lucide-react'
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
}

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
}: ChapterTextEditorProps) {
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
      >
        <EditorContent editor={editor} className={css.content} />
      </div>
    </div>
  )
}
