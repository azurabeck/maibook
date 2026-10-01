import { useMemo, useState } from 'react'
import { BookMarked, LoaderCircle, Pencil, Plus, RefreshCw, Search, Sparkles, Trash2, X } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { createGlossaryTerm, deleteGlossaryTerm, updateGlossaryTerm } from '@/services/firestore/glossary'
import { addGlossaryTermWithAi, findGlossaryTerm, generateGlossaryDefinition, normalizeTerm, useGlossaryTerms } from '@/services/glossary'
import type { GlossaryTerm } from '@/types'
import { glossaryManagerCss as css } from './css'

// Estruturas → Glossário: tudo que foi adicionado (pelo botão direito
// no texto ou à mão), com edição de termo e definição.
export function GlossaryManager({ projectId }: { projectId: string }) {
  const project = useProjectStore((state) => state.currentProject)
  const chapters = useProjectStore((state) => state.chapters)
  const { terms, loading } = useGlossaryTerms(projectId)
  const book = { bookTitle: project?.title ?? '', chapters, sections: project?.sections }

  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [newTerm, setNewTerm] = useState('')
  const [newDefinition, setNewDefinition] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTerm, setEditTerm] = useState('')
  const [editDefinition, setEditDefinition] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const key = normalizeTerm(query)
    if (!key) return terms
    return terms.filter((item) => normalizeTerm(item.term).includes(key) || normalizeTerm(item.definition).includes(key))
  }, [terms, query])

  function resetAdd() {
    setAdding(false)
    setNewTerm('')
    setNewDefinition('')
  }

  // Salva o termo novo: com definição escrita à mão, ou pedindo à IA
  async function handleAdd(withAi: boolean) {
    const term = newTerm.trim()
    if (!term) return
    if (findGlossaryTerm(terms, term)) {
      setError(`“${term}” já está no glossário.`)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (withAi) {
        await addGlossaryTermWithAi(projectId, { term }, book, ({ ok, error: aiError }) => {
          if (!ok) setError(`A IA não conseguiu definir “${term}”: ${aiError instanceof Error ? aiError.message : 'erro desconhecido'}`)
        })
      } else {
        await createGlossaryTerm(projectId, { term, definition: newDefinition })
      }
      resetAdd()
    } catch (addError) {
      console.error('Falha ao adicionar termo:', addError)
      setError('Não foi possível adicionar o termo. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(item: GlossaryTerm) {
    setEditingId(item.id)
    setEditTerm(item.term)
    setEditDefinition(item.definition)
    setError('')
  }

  async function handleSaveEdit(item: GlossaryTerm) {
    const term = editTerm.trim()
    if (!term) return
    const duplicate = findGlossaryTerm(terms, term)
    if (duplicate && duplicate.id !== item.id) {
      setError(`“${term}” já está no glossário.`)
      return
    }
    setBusy(true)
    try {
      await updateGlossaryTerm(projectId, item.id, { term, definition: editDefinition, status: null })
      setEditingId(null)
    } catch (saveError) {
      console.error('Falha ao salvar termo:', saveError)
      setError('Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  // (Re)gera a definição com a IA — usa o termo como está no campo de
  // edição, se estiver editando
  async function handleRegenerate(item: GlossaryTerm) {
    const term = editingId === item.id ? editTerm.trim() || item.term : item.term
    setError('')
    if (editingId === item.id) {
      await updateGlossaryTerm(projectId, item.id, { term }).catch(() => undefined)
      setEditingId(null)
    }
    try {
      await generateGlossaryDefinition(projectId, item.id, term, book)
    } catch (aiError) {
      setError(`A IA não conseguiu definir “${term}”: ${aiError instanceof Error ? aiError.message : 'erro desconhecido'}`)
    }
  }

  async function handleDelete(item: GlossaryTerm) {
    if (!window.confirm(`Remover “${item.term}” do glossário?`)) return
    try {
      await deleteGlossaryTerm(projectId, item.id)
    } catch (deleteError) {
      console.error('Falha ao remover termo:', deleteError)
      setError('Não foi possível remover o termo. Tente novamente.')
    }
  }

  return (
    <div className={css.root}>
      <div className={css.intro}>
        <div>
          <p className={css.tag}><BookMarked size={14} /> Referência do livro</p>
          <h2 className={css.title}>Glossário</h2>
          <p className={css.description}>
            Termos, nomes e lugares do seu livro. No editor, clique com o botão direito numa palavra
            (ou num trecho selecionado) e escolha "Adicionar ao Glossário" — a IA escreve um resumo
            curto, como num dicionário, com base no que o livro conta. Aqui você vê tudo, adiciona à
            mão e edita.
          </p>
        </div>
        <button className={css.addButton} type="button" onClick={() => { setAdding(true); setError('') }} disabled={adding}>
          <Plus size={16} /> Adicionar termo
        </button>
      </div>

      {error && (
        <p className={css.error} role="alert">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Fechar aviso"><X size={13} /></button>
        </p>
      )}

      {adding && (
        <div className={css.formCard}>
          <label className={css.field}>
            Termo
            <input autoFocus value={newTerm} onChange={(event) => setNewTerm(event.target.value)} placeholder="Ex.: Thorgul, Latipha, hipogrifo..." />
          </label>
          <label className={css.field}>
            Definição (opcional se for gerar com IA)
            <textarea rows={2} value={newDefinition} onChange={(event) => setNewDefinition(event.target.value)} placeholder="Resumo curto, de até 2 linhas" />
          </label>
          <div className={css.formActions}>
            <button type="button" className={css.secondary} onClick={resetAdd}>Cancelar</button>
            <button type="button" className={css.secondary} disabled={!newTerm.trim() || busy} onClick={() => void handleAdd(true)}>
              <Sparkles size={14} /> Gerar definição com IA
            </button>
            <button type="button" className={css.primary} disabled={!newTerm.trim() || busy} onClick={() => void handleAdd(false)}>
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className={css.toolbar}>
        <label className={css.search}>
          <Search size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no glossário" />
        </label>
        <span className={css.count}>{terms.length} {terms.length === 1 ? 'termo' : 'termos'}</span>
      </div>

      {loading ? (
        <p className={css.empty}>Carregando glossário...</p>
      ) : terms.length === 0 ? (
        <p className={css.empty}>Nenhum termo ainda. Clique com o botão direito numa palavra do texto, ou use "Adicionar termo".</p>
      ) : filtered.length === 0 ? (
        <p className={css.empty}>Nada encontrado para “{query}”.</p>
      ) : (
        <ul className={css.list}>
          {filtered.map((item) => (
            <li key={item.id} className={css.item}>
              {editingId === item.id ? (
                <div className={css.editForm}>
                  <label className={css.field}>
                    Termo
                    <input value={editTerm} onChange={(event) => setEditTerm(event.target.value)} />
                  </label>
                  <label className={css.field}>
                    Definição
                    <textarea rows={2} value={editDefinition} onChange={(event) => setEditDefinition(event.target.value)} />
                  </label>
                  <div className={css.formActions}>
                    <button type="button" className={css.secondary} onClick={() => setEditingId(null)}>Cancelar</button>
                    <button type="button" className={css.secondary} disabled={busy} onClick={() => void handleRegenerate(item)}>
                      <Sparkles size={14} /> Gerar de novo com IA
                    </button>
                    <button type="button" className={css.primary} disabled={!editTerm.trim() || busy} onClick={() => void handleSaveEdit(item)}>
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={css.itemText}>
                    <strong>{item.term}</strong>
                    {item.status === 'generating' ? (
                      <span className={css.pending}><LoaderCircle size={13} className={css.spinner} /> A IA está escrevendo a definição...</span>
                    ) : item.status === 'error' ? (
                      <span className={css.failed}>
                        Não foi possível gerar a definição.
                        <button type="button" onClick={() => void handleRegenerate(item)}><RefreshCw size={12} /> Tentar de novo</button>
                      </span>
                    ) : item.definition ? (
                      <p>{item.definition}</p>
                    ) : (
                      <p className={css.muted}>Sem definição ainda.</p>
                    )}
                  </div>
                  <div className={css.itemActions}>
                    <button type="button" onClick={() => startEdit(item)} aria-label={`Editar ${item.term}`} title="Editar termo e definição">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => void handleRegenerate(item)} disabled={item.status === 'generating'} aria-label={`Gerar de novo a definição de ${item.term}`} title="Gerar a definição de novo com IA">
                      <Sparkles size={14} />
                    </button>
                    <button type="button" className={css.danger} onClick={() => void handleDelete(item)} aria-label={`Remover ${item.term}`} title="Remover do glossário">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
