import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { BookImage, Image as ImageIcon, Link2, Sparkles, Trash2, X } from 'lucide-react'
import { updateCover } from '@/services/firestore/projects'
import { uploadCoverImage, validateImageFile } from '@/services/storage/images'
import { useProjectStore } from '@/store/useProjectStore'
import type { BookCover } from '@/types'
import { coverManagerCss as css } from './css'

const DEFAULT_BACKGROUND_COLOR = '#1f2933'
const DEFAULT_TEXT_COLOR = '#ffffff'

function hasCover(cover?: BookCover | null): cover is BookCover {
  return Boolean(cover && (cover.imageUrl || cover.title || cover.subtitle))
}

// Remove chaves undefined antes de gravar — o SDK do Firestore rejeita
// `undefined` em campos de um objeto aninhado (updateDoc/setDoc).
function cleanCover(cover: BookCover): BookCover {
  const entries = Object.entries(cover).filter(([, value]) => value !== undefined && value !== '')
  return Object.fromEntries(entries) as BookCover
}

function CoverPreview({ cover }: { cover?: BookCover | null }) {
  return (
    <div
      className={css.preview}
      style={{
        backgroundColor: cover?.backgroundColor || DEFAULT_BACKGROUND_COLOR,
        backgroundImage: cover?.imageUrl ? `url(${cover.imageUrl})` : undefined,
      }}
    >
      {hasCover(cover) ? (
        <>
          {cover?.title && (
            <h3 className={css.previewTitle} style={{ color: cover.textColor || DEFAULT_TEXT_COLOR }}>
              {cover.title}
            </h3>
          )}
          {cover?.subtitle && (
            <p className={css.previewSubtitle} style={{ color: cover.textColor || DEFAULT_TEXT_COLOR }}>
              {cover.subtitle}
            </p>
          )}
        </>
      ) : (
        <div className={css.previewEmpty}>
          <BookImage size={24} />
          <span>Nenhuma capa definida ainda</span>
        </div>
      )}
    </div>
  )
}

export function CoverManager({ projectId }: { projectId: string }) {
  const cover = useProjectStore((state) => state.currentProject?.cover)
  const projectTitle = useProjectStore((state) => state.currentProject?.title)

  const [uploading, setUploading] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<BookCover>({})
  const [draftUploading, setDraftUploading] = useState(false)
  const [draftLinkDraft, setDraftLinkDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  async function handleQuickUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')
    try {
      const imageUrl = await uploadCoverImage(projectId, file)
      await updateCover(projectId, cleanCover({ ...cover, imageUrl }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  async function handleQuickLink() {
    const url = linkDraft.trim()
    if (!url) return
    setError('')
    try {
      await updateCover(projectId, cleanCover({ ...cover, imageUrl: url }))
      setLinkDraft('')
    } catch {
      setError('Não foi possível salvar o link da imagem.')
    }
  }

  async function handleRemoveCover() {
    const confirmed = window.confirm('Remover a capa do livro?')
    if (!confirmed) return
    await updateCover(projectId, null)
  }

  function openBuilder() {
    setDraft(cover ? { ...cover } : {
      title: projectTitle || '',
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      textColor: DEFAULT_TEXT_COLOR,
    })
    setDraftLinkDraft('')
    setModalError('')
    setModalOpen(true)
  }

  async function handleDraftUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setModalError(validationError)
      return
    }

    setDraftUploading(true)
    setModalError('')
    try {
      const imageUrl = await uploadCoverImage(projectId, file)
      setDraft((current) => ({ ...current, imageUrl }))
    } catch (uploadError) {
      setModalError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a imagem.')
    } finally {
      setDraftUploading(false)
    }
  }

  function handleDraftLink() {
    const url = draftLinkDraft.trim()
    if (!url) return
    setDraft((current) => ({ ...current, imageUrl: url }))
    setDraftLinkDraft('')
  }

  async function handleSaveDraft() {
    setSaving(true)
    setModalError('')
    try {
      await updateCover(projectId, cleanCover(draft))
      setModalOpen(false)
    } catch {
      setModalError('Não foi possível salvar a capa.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={css.root}>
      <div className={css.intro}>
        <div>
          <p className={css.tag}><BookImage size={14} /> Identidade do livro</p>
          <h2 className={css.title}>Capa</h2>
          <p className={css.description}>
            Envie uma imagem pronta (upload ou link) pra usar como capa, ou clique em "Montar capa"
            pra escolher título, cor de fundo e o resto direto por aqui. Assim que a capa for definida,
            ela passa a aparecer como a primeira página em "Visualizar livro".
          </p>
        </div>
        <button className={css.build} type="button" onClick={openBuilder}>
          <Sparkles size={16} /> Montar capa
        </button>
      </div>

      <div className={css.body}>
        <div className={css.previewCol}>
          <p className={css.previewLabel}>Prévia da capa</p>
          <CoverPreview cover={cover} />
        </div>

        <div className={css.actions}>
          <div className={css.actionGroup}>
            <span>Imagem da capa</span>
            <div className={css.row}>
              <label className={css.upload}>
                <input type="file" accept="image/*" hidden onChange={(event) => void handleQuickUpload(event)} disabled={uploading} />
                <ImageIcon size={14} /> {uploading ? 'Enviando...' : 'Enviar imagem'}
              </label>
            </div>
            <div className={css.row}>
              <input
                className={css.linkInput}
                type="url"
                placeholder="Ou cole o link de uma imagem"
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') void handleQuickLink() }}
              />
              <button className={css.linkButton} type="button" onClick={() => void handleQuickLink()} disabled={!linkDraft.trim()}>
                <Link2 size={14} /> Usar link
              </button>
            </div>
            {error && <p className={css.error}>{error}</p>}
          </div>

          {hasCover(cover) && (
            <button className={css.remove} type="button" onClick={() => void handleRemoveCover()}>
              <Trash2 size={14} /> Remover capa
            </button>
          )}

          <p className={css.hint}>
            Uma imagem enviada aqui vira a capa diretamente. Pra combinar imagem com título e cores
            organizados, use "Montar capa".
          </p>
        </div>
      </div>

      {modalOpen && (
        <div className={css.overlay} onMouseDown={() => setModalOpen(false)}>
          <div className={css.editor} onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.header}>
              <div>
                <p className={css.eyebrow}>Montar capa</p>
                <h2>Capa do livro</h2>
                <p>Defina título, cores e imagem de fundo da capa.</p>
              </div>
              <button className={css.close} type="button" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </header>

            <div className={css.content}>
              <div className={css.controls}>
                <section className={css.section}>
                  <h3>1. Texto</h3>
                  <label className={css.field}>
                    Título
                    <input value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Título do livro" />
                  </label>
                  <label className={css.field}>
                    Subtítulo (opcional)
                    <input value={draft.subtitle || ''} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} placeholder="Ex.: nome do(a) autor(a)" />
                  </label>
                </section>

                <section className={css.section}>
                  <h3>2. Cores</h3>
                  <div className={css.twoCols}>
                    <label className={css.colorField}>
                      Cor de fundo
                      <input type="color" value={draft.backgroundColor || DEFAULT_BACKGROUND_COLOR} onChange={(event) => setDraft({ ...draft, backgroundColor: event.target.value })} />
                    </label>
                    <label className={css.colorField}>
                      Cor do texto
                      <input type="color" value={draft.textColor || DEFAULT_TEXT_COLOR} onChange={(event) => setDraft({ ...draft, textColor: event.target.value })} />
                    </label>
                  </div>
                </section>

                <section className={css.section}>
                  <h3>3. Imagem de fundo (opcional)</h3>
                  <div className={css.row}>
                    <label className={css.upload}>
                      <input type="file" accept="image/*" hidden onChange={(event) => void handleDraftUpload(event)} disabled={draftUploading} />
                      <ImageIcon size={14} /> {draftUploading ? 'Enviando...' : 'Enviar imagem'}
                    </label>
                  </div>
                  <div className={css.row}>
                    <input
                      className={css.linkInput}
                      type="url"
                      placeholder="Ou cole o link de uma imagem"
                      value={draftLinkDraft}
                      onChange={(event) => setDraftLinkDraft(event.target.value)}
                      onKeyDown={(event) => { if (event.key === 'Enter') handleDraftLink() }}
                    />
                    <button className={css.linkButton} type="button" onClick={handleDraftLink} disabled={!draftLinkDraft.trim()}>
                      <Link2 size={14} /> Usar link
                    </button>
                  </div>
                  {draft.imageUrl && (
                    <button className={css.remove} type="button" onClick={() => setDraft({ ...draft, imageUrl: undefined })}>
                      <Trash2 size={14} /> Remover imagem
                    </button>
                  )}
                  {modalError && <p className={css.error}>{modalError}</p>}
                </section>
              </div>

              <div className={css.previewArea}>
                <p>Prévia</p>
                <CoverPreview cover={draft} />
              </div>
            </div>

            <footer className={css.footer}>
              <button className={css.cancel} type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={css.save} type="button" disabled={saving} onClick={() => void handleSaveDraft()}>
                {saving ? 'Salvando...' : 'Salvar capa'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
