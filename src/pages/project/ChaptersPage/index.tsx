import { useState } from 'react'
import { BarChart3, Bot, PenLine, List } from 'lucide-react'
import { ChapterListPanel } from '@/components/organisms/ChapterListPanel/index'
import { EditorPanel } from '@/components/organisms/EditorPanel/index'
import { CopilotPanel } from '@/components/organisms/CopilotPanel/index'
import { OverviewPanel } from '@/components/organisms/OverviewPanel/index'
import { chaptersPageCss as css } from './css'

type MobilePanel = 'chapters' | 'editor' | 'copiloto' | 'overview'

const MOBILE_TABS: Array<{ id: MobilePanel; label: string; icon: typeof List }> = [
  { id: 'chapters', label: 'Capítulos', icon: List },
  { id: 'editor', label: 'Escrever', icon: PenLine },
  { id: 'copiloto', label: 'Copiloto', icon: Bot },
  { id: 'overview', label: 'Visão geral', icon: BarChart3 },
]

// Esta é a tela principal de escrita: lista de capítulos + editor +
// copiloto de IA + visão geral, lado a lado, igual ao Figma.
//
// Em telas pequenas (celular) não cabem os 4 blocos ao mesmo tempo:
// só um fica visível por vez, escolhido pelas abinhas abaixo do
// cabeçalho — por padrão o Editor, que é onde a escrita acontece, já
// ocupando 100% da largura e altura disponíveis. Em telas maiores
// esse estado não tem efeito nenhum: os 4 blocos continuam lado a
// lado como sempre (ver o media query em css.ts).
export function ChaptersPage() {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('editor')

  return (
    <div className={css.root}>
      <nav className={css.mobileTabs} aria-label="Painel ativo">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={mobilePanel === tab.id ? css.mobileTabActive : css.mobileTab}
            onClick={() => setMobilePanel(tab.id)}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={mobilePanel === 'chapters' ? css.cellActive : css.cell}>
        <ChapterListPanel />
      </div>
      <div className={mobilePanel === 'editor' ? css.cellActive : css.cell}>
        <EditorPanel />
      </div>
      <div className={mobilePanel === 'copiloto' ? css.cellActive : css.cell}>
        <CopilotPanel />
      </div>
      <div className={mobilePanel === 'overview' ? css.cellActive : css.cell}>
        <OverviewPanel />
      </div>
    </div>
  )
}
