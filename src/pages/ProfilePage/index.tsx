import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { BookOpen } from 'lucide-react'
import { auth } from '@/services/firebase'
import { fetchProjectWordCount } from '@/services/firestore/chapters'
import { subscribeToUserProjects } from '@/services/firestore/projects'
import { getUserGenres, setUserGenres } from '@/services/userSettings'
import { Avatar } from '@/components/atoms/Avatar/index'
import { Button } from '@/components/atoms/Button/index'
import { FormField } from '@/components/molecules/FormField/index'
import { accountLayoutCss } from '@/components/templates/AccountLayout/css'
import { LITERARY_GENRES } from '@/constants/literaryGenres'
import { useAuthStore } from '@/store/useAuthStore'
import type { BookProject } from '@/types'
import { profilePageCss } from './css'
import type { ProjectWordCounts } from './type'

// Estimativa de páginas: média de um livro impresso. O número exato
// depende do grid de cada projeto (formato, fonte, margens) e só é
// calculado na pré-visualização do livro.
const WORDS_PER_PAGE = 250

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function plural(value: number, singular: string, pluralForm: string) {
  return `${formatNumber(value)} ${value === 1 ? singular : pluralForm}`
}

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const uid = user?.uid

  // #region Dados do perfil
  const [name, setName] = useState(user?.displayName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL ?? '')
  const [genres, setGenres] = useState<string[]>(() => (uid ? getUserGenres(uid) : []))
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null)

  function toggleGenre(genre: string) {
    setGenres((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth.currentUser || !uid) return

    setSaving(true)
    setFeedback(null)
    try {
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        // null remove a imagem (volta a mostrar a inicial do nome)
        photoURL: avatarUrl.trim() || null,
      })
      setUserGenres(uid, genres)
      refreshUser()
      setFeedback({ text: 'Perfil salvo.' })
    } catch {
      setFeedback({ text: 'Não foi possível salvar o perfil. Tente novamente.', error: true })
    } finally {
      setSaving(false)
    }
  }
  // #endregion

  // #region Projetos do usuário
  const [projects, setProjects] = useState<BookProject[] | null>(null)
  const [wordCounts, setWordCounts] = useState<ProjectWordCounts>({})

  useEffect(() => {
    if (!uid) return
    return subscribeToUserProjects(uid, (list) =>
      setProjects([...list].sort((a, b) => b.updatedAt - a.updatedAt)),
    )
  }, [uid])

  // conta as palavras de cada projeto uma vez só (os que já foram
  // contados não são buscados de novo quando a lista atualiza)
  const projectIds = projects?.map((project) => project.id).join(',') ?? ''

  useEffect(() => {
    if (!projectIds) return
    let cancelled = false

    projectIds.split(',').forEach((projectId) => {
      fetchProjectWordCount(projectId)
        .then((count) => {
          if (!cancelled) setWordCounts((current) => ({ ...current, [projectId]: count }))
        })
        .catch(() => undefined)
    })

    return () => {
      cancelled = true
    }
  }, [projectIds])
  // #endregion

  if (!user) return null

  const displayName = user.displayName || 'Autor'

  return (
    <>
      <section className={`${accountLayoutCss.card} ${profilePageCss.hero}`}>
        <Avatar name={displayName} imageUrl={user.photoURL} size={72} />
        <div className={profilePageCss.heroText}>
          <span className={accountLayoutCss.cardLabel}>Meu perfil</span>
          <h1>{displayName}</h1>
          <p>{user.email}</p>
        </div>
      </section>

      <section className={accountLayoutCss.card}>
        <h2>Seus dados</h2>
        <p className={accountLayoutCss.cardDescription}>
          Como você aparece no MAIBOOK.
        </p>

        <form onSubmit={handleSubmit}>
          <FormField
            id="profile-name"
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
          />
          <FormField
            id="profile-avatar"
            label="Link da imagem do avatar"
            type="url"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <fieldset className={profilePageCss.genres}>
            <legend>Gêneros literários preferidos</legend>
            <p className={profilePageCss.genresHint}>Selecione quantos quiser.</p>
            <div className={profilePageCss.genresList}>
              {LITERARY_GENRES.map((genre) => {
                const active = genres.includes(genre)
                return (
                  <button
                    key={genre}
                    type="button"
                    className={active ? profilePageCss.genreActive : profilePageCss.genre}
                    aria-pressed={active}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className={accountLayoutCss.cardActions}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </Button>
            {feedback && (
              <p className={feedback.error ? accountLayoutCss.feedbackError : accountLayoutCss.feedback}>
                {feedback.text}
              </p>
            )}
          </div>
        </form>
      </section>

      <section className={accountLayoutCss.card}>
        <h2>Seus projetos</h2>
        <p className={accountLayoutCss.cardDescription}>
          Quanto você já escreveu em cada livro. As páginas são uma estimativa
          ({WORDS_PER_PAGE} palavras por página).
        </p>

        {projects === null ? (
          <p className={profilePageCss.projectsEmpty}>Carregando projetos...</p>
        ) : projects.length === 0 ? (
          <p className={profilePageCss.projectsEmpty}>Você ainda não tem nenhum projeto.</p>
        ) : (
          <ul className={profilePageCss.projects}>
            {projects.map((project) => {
              const words = wordCounts[project.id]
              return (
                <li key={project.id} className={profilePageCss.project}>
                  <div className={profilePageCss.projectIcon}>
                    <BookOpen size={18} />
                  </div>
                  <div className={profilePageCss.projectInfo}>
                    <Link to={`/projeto/${project.id}/capitulos`}>{project.title}</Link>
                    <p>
                      {words === undefined
                        ? 'Contando palavras...'
                        : `${plural(words, 'palavra', 'palavras')} · ≈ ${plural(Math.ceil(words / WORDS_PER_PAGE), 'página', 'páginas')}`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
