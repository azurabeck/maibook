import { Link } from 'react-router-dom'
import { BookOpen, BrainCircuit, Layers, Moon, Sparkles, Sun } from 'lucide-react'
import { Button } from '@/components/atoms/Button/index'
import { useTheme } from '@/contexts/ThemeContext'
import { publicPageCss } from './css'

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
    <div className={publicPageCss.page}>
      <header className={publicPageCss.topNav}>
        <Link to="/" className={publicPageCss.topNavLogo} aria-label="MAIBOOK início">
          MAIBOOK
        </Link>

        <nav className={publicPageCss.navTabs} aria-label="Navegação pública">
          <a href="#recursos" className={publicPageCss.navTab}>Recursos</a>
          <a href="#preview" className={publicPageCss.navTab}>Editor</a>
          <a href="#dashboard" className={publicPageCss.navTab}>Dashboard</a>
        </nav>

        <div className={publicPageCss.topNavActions}>
          <button
            className={publicPageCss.themeToggle}
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link to="/login" className={publicPageCss.loginLink}>Entrar</Link>
        </div>
      </header>

      <main className={publicPageCss.hero}>
        <section className={publicPageCss.heroContent}>
          <span className={publicPageCss.heroEyebrow}>
            <Sparkles size={16} /> Plataforma de escrita com IA
          </span>

          <h1>Transforme ideias soltas em um livro organizado.</h1>

          <p>
            O MAIBOOK ajuda você a escrever, revisar e estruturar histórias longas com
            capítulos, personagens, timeline e apoio criativo em um ambiente limpo.
          </p>

          <div className={publicPageCss.heroButtons}>
            <Link to="/login"><Button>Começar agora</Button></Link>
            <a href="#recursos" className={publicPageCss.heroSecondary}>Ver recursos</a>
          </div>
        </section>

        <section id="preview" className={publicPageCss.preview} aria-label="Prévia do editor MAIBOOK">
          <div className={publicPageCss.previewHeader}>
            <span />
            <span />
            <span />
          </div>

          <div className={publicPageCss.previewBody}>
            <aside>
              <strong>Capítulos</strong>
              <span className={publicPageCss.activeText}>Capítulo 01</span>
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

      <section id="recursos" className={publicPageCss.features}>
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <article key={feature.title} className={publicPageCss.featureCard}>
              <Icon size={22} />
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          )
        })}
      </section>

      <section id="dashboard" className={publicPageCss.dashboardPreview}>
        <div>
          <span className={publicPageCss.dashboardPreviewLabel}>Dashboard</span>
          <h2>Todos os seus livros em uma entrada simples.</h2>
          <p>
            Depois do login, o autor cai em uma área limpa para criar, abrir e continuar seus
            projetos sem disputar atenção com o editor.
          </p>
        </div>

        <div className={publicPageCss.dashboardPreviewCards}>
          <span>Romance de fantasia</span>
          <span>Contos soltos</span>
          <span>Novo livro sem título</span>
        </div>
      </section>
    </div>
  )
}
