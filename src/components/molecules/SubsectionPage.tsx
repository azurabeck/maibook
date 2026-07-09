import { useState } from 'react'

interface SubsectionPageProps {
  title: string
  sections: string[]
}

// Componente genérico pras abas que ainda não têm design definido no
// Figma (Estruturas, Personagens, Timeline, Ideias). Mostra as
// sub-seções como pílulas clicáveis e um placeholder de conteúdo.
// Quando cada sub-seção for desenhada de verdade, ela vira uma
// página própria (como fizemos com ChaptersPage).
export function SubsectionPage({ title, sections }: SubsectionPageProps) {
  // guarda qual sub-seção está selecionada, começando pela primeira
  const [active, setActive] = useState(sections[0])

  return (
    <div className="subsection-page">
      <h1 className="subsection-page__title">{title}</h1>

      <div className="subsection-page__pills">
        {sections.map((section) => (
          <button
            key={section}
            className={section === active ? 'pill active' : 'pill'}
            onClick={() => setActive(section)}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="subsection-page__content panel">
        <p>
          Conteúdo de <strong>{active}</strong> ainda não foi desenhado — assim que você tiver o
          layout dessa parte, a gente monta igual fizemos com Capítulos.
        </p>
      </div>
    </div>
  )
}
