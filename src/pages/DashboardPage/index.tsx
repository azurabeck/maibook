import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore'
import { BookOpen, Moon, Plus, Sun } from 'lucide-react'
import { db, auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button/index'
import { useTheme } from '@/contexts/ThemeContext'
import type { BookProject } from '@/types'
import { dashboardPageCss } from './css'

export function DashboardPage() {
  const [projects, setProjects] = useState<BookProject[]>([])
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const q = query(collection(db, 'projects'), where('ownerId', '==', uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as BookProject,
      )
      setProjects(data)
    })

    return () => unsubscribe()
  }, [])

  async function handleCreateProject() {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const newProject: Omit<BookProject, 'id'> = {
      ownerId: uid,
      title: 'Novo livro sem título',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const docRef = await addDoc(collection(db, 'projects'), newProject)
    navigate(`/projeto/${docRef.id}/capitulos`)
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
