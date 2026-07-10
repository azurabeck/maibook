import { useState } from 'react'
import { HeaderStructureManager } from '@/components/organisms/HeaderStructureManager/index'
import { useProjectStore } from '@/store/useProjectStore'
import { structurePageCss as css } from './css'
import { structurePageSections } from './type'

export function StructurePage() {
  const [activeSection, setActiveSection] = useState(structurePageSections[0])
  const projectId = useProjectStore((state) => state.currentProject?.id)

  return (
    <div className={css.root}>
      <h1 className={css.title}>Estruturas</h1>

      <nav className={css.tabs} aria-label="Seções de estruturas">
        {structurePageSections.map((section) => (
          <button
            key={section}
            className={section === activeSection ? css.tabActive : css.tab}
            type="button"
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      <section className={css.content}>
        {activeSection === 'Cabeçalho' && projectId ? (
          <HeaderStructureManager projectId={projectId} />
        ) : (
          <div className={css.placeholder}>
            <p>
              Conteúdo de <strong>{activeSection}</strong> será configurado nesta área.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
