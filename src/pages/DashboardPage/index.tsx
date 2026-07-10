import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { BookOpen, Moon, Plus, Sun } from 'lucide-react'
import { auth } from '@/services/firebase'
import { createProject, subscribeToUserProjects } from '@/services/firestore/projects'
import { Button } from '@/components/atoms/Button/index'
import { useTheme } from '@/contexts/ThemeContext'
import type { BookProject } from '@/types'
import { dashboardPageCss } from './css'

export function DashboardPage() {
  const [projects, setProjects] = useState<BookProject[]>([])
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    // onAuthStateChanged garante que a gente só monta a query de
    // projetos depois que o Firebase Auth confirmou (ou não) o uid —
    // logo após um F5, auth.currentUser pode ainda estar undefined
    // por uma fração de segundo, e a busca antiga perdia esse caso.
    let unsubscribeProjects: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // troca de usuário (ou logout): encerra a query anterior antes de abrir outra
      unsubscribeProjects?.()
      unsubscribeProjects = null

      if (!user) {
        setProjects([])
        return
      }

      unsubscribeProjects = subscribeToUserProjects(user.uid, setProjects)
    })

    return () => {
      unsubscribeAuth()
      unsubscribeProjects?.()
    }
  }, [])

  async function handleCreateProject() {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const projectId = await createProject(uid)
    navigate(`/projeto/${projectId}/capitulos`)
  }

  return (
    <div className={dashboardPageCss.shell}>
      <header className={dashboardPageCss.topNav}>
        <Link to="/dashboard" className={dashboardPageCss.topNavLogo} aria-label="MAIBOOK dashboard">
          MAIBOOK
        </Link>

        <nav className={dashboardPageCss.navTabs} aria-label="Navegação do dashboard">
          <span className={dashboardPageCss.activeTab}>Projetos</span>
          <span className={dashboardPageCss.navTab}>Recentes</span>
          <span className={dashboardPageCss.navTab}>Modelos</span>
        </nav>

        <div className={dashboardPageCss.topNavActions}>
          <button
            className={dashboardPageCss.themeToggle}
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className={dashboardPageCss.topNavAvatar} type="button">
            <span className={dashboardPageCss.avatarCircle}>A</span>
          </button>
        </div>
      </header>

      <main className={dashboardPageCss.page}>
        <section className={dashboardPageCss.hero}>
          <div>
            <span className={dashboardPageCss.heroLabel}>Biblioteca</span>
            <h1>Meus livros</h1>
            <p>Crie um novo projeto ou continue escrevendo de onde parou.</p>
          </div>

          <Button onClick={handleCreateProject} className={dashboardPageCss.heroButton}>
            <Plus size={16} /> Novo projeto
          </Button>
        </section>

        {projects.length > 0 ? (
          <section className={dashboardPageCss.grid}>
            {projects.map((project) => (
              <article key={project.id} className={dashboardPageCss.projectCard}>
                <div className={dashboardPageCss.projectCardIcon}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2>{project.title}</h2>
                  <p>Última atualização salva no projeto.</p>
                </div>
                <button onClick={() => navigate(`/projeto/${project.id}/capitulos`)}>
                  Abrir projeto
                </button>
              </article>
            ))}
          </section>
        ) : (
          <section className={dashboardPageCss.empty}>
            <BookOpen size={28} />
            <h2>Você ainda não tem nenhum projeto.</h2>
            <p>Crie o primeiro livro para liberar capítulos, estrutura, personagens e timeline.</p>
            <Button onClick={handleCreateProject}>Criar primeiro projeto</Button>
          </section>
        )}
      </main>
    </div>
  )
}
