import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore'
import { BookOpen, Moon, Plus, Sun } from 'lucide-react'
import { db, auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button'
import { useTheme } from '@/contexts/ThemeContext'
import type { BookProject } from '@/types'

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
    <div className="dashboard-shell">
      <header className="top-nav top-nav--dashboard">
        <Link to="/dashboard" className="top-nav__logo" aria-label="MAIBOOK dashboard">
          MAIBOOK
        </Link>

        <nav className="top-nav__tabs dashboard-nav__tabs" aria-label="Navegação do dashboard">
          <span className="top-nav__tab active">Projetos</span>
          <span className="top-nav__tab">Recentes</span>
          <span className="top-nav__tab">Modelos</span>
        </nav>

        <div className="top-nav__actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="top-nav__avatar" type="button">
            <span className="avatar-circle">A</span>
          </button>
        </div>
      </header>

      <main className="dashboard-page">
        <section className="dashboard-hero panel">
          <div>
            <span className="dashboard-hero__label">Biblioteca</span>
            <h1>Meus livros</h1>
            <p>Crie um novo projeto ou continue escrevendo de onde parou.</p>
          </div>

          <Button onClick={handleCreateProject} className="dashboard-hero__button">
            <Plus size={16} /> Novo projeto
          </Button>
        </section>

        {projects.length > 0 ? (
          <section className="dashboard-grid">
            {projects.map((project) => (
              <article key={project.id} className="project-card panel">
                <div className="project-card__icon">
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
          <section className="dashboard-empty panel">
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
