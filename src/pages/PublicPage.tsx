import { Link } from 'react-router-dom'
import { BookOpen, BrainCircuit, Layers, Moon, Sparkles, Sun } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { useTheme } from '@/contexts/ThemeContext'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Escrita por capítulos',
    description: 'Organize cenas, capítulos e revisões sem perder o fio da história.',
  },
  {
    icon: BrainCircuit,
    title: 'Copiloto criativo',
    description: 'Use IA para revisar trechos, destravar ideias e encontrar inconsistências narrativas.',
  },
  {
    icon: Layers,
    title: 'Projeto vivo',
    description: 'Centralize personagens, timeline, sinopse, ideias e materiais em um só lugar.',
  },
]

export function PublicPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="public-page">
      <header className="top-nav top-nav--public">
        <Link to="/" className="top-nav__logo" aria-label="MAIBOOK início">
          MAIBOOK
        </Link>

        <nav className="top-nav__tabs public-nav__tabs" aria-label="Navegação pública">
          <a href="#recursos" className="top-nav__tab">
            Recursos
          </a>
          <a href="#preview" className="top-nav__tab">
            Editor
          </a>
          <a href="#dashboard" className="top-nav__tab">
            Dashboard
          </a>
        </nav>

        <div className="top-nav__actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link to="/login" className="btn btn--secondary public-nav__login">
            Entrar
          </Link>
        </div>
      </header>

      <main className="public-hero">
        <section className="public-hero__content">
          <span className="public-hero__eyebrow">
            <Sparkles size={16} /> Plataforma de escrita com IA
          </span>

          <h1>Transforme ideias soltas em um livro organizado.</h1>

          <p>
            O MAIBOOK ajuda você a escrever, revisar e estruturar histórias longas com
            capítulos, personagens, timeline e apoio criativo em um ambiente limpo.
          </p>

          <div className="public-hero__buttons">
            <Link to="/login">
              <Button>Começar agora</Button>
            </Link>
            <a href="#recursos" className="btn btn--secondary public-hero__secondary">
              Ver recursos
            </a>
          </div>
        </section>

        <section id="preview" className="public-preview panel" aria-label="Prévia do editor MAIBOOK">
          <div className="public-preview__header">
            <span />
            <span />
            <span />
          </div>

          <div className="public-preview__body">
            <aside>
              <strong>Capítulos</strong>
              <span className="active">Capítulo 01</span>
              <span>Capítulo 02</span>
              <span>Capítulo 03</span>
            </aside>

            <article>
              <small>Editor</small>
              <h2>A garota abriu o caderno...</h2>
              <p>
                O primeiro parágrafo já carregava uma promessa: aquela história não queria
                ficar guardada só como ideia.
              </p>
            </article>
          </div>
        </section>
      </main>

      <section id="recursos" className="public-features">
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <article key={feature.title} className="public-feature panel">
              <Icon size={22} />
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          )
        })}
      </section>

      <section id="dashboard" className="public-dashboard-preview panel">
        <div>
          <span className="public-dashboard-preview__label">Dashboard</span>
          <h2>Todos os seus livros em uma entrada simples.</h2>
          <p>
            Depois do login, o autor cai em uma área limpa para criar, abrir e continuar seus
            projetos sem disputar atenção com o editor.
          </p>
        </div>

        <div className="public-dashboard-preview__cards">
          <span>Romance de fantasia</span>
          <span>Contos soltos</span>
          <span>Novo livro sem título</span>
        </div>
      </section>
    </div>
  )
}
