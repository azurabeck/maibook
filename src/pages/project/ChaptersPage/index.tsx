import { ChapterListPanel } from '@/components/organisms/ChapterListPanel/index'
import { EditorPanel } from '@/components/organisms/EditorPanel/index'
import { CopilotPanel } from '@/components/organisms/CopilotPanel/index'
import { OverviewPanel } from '@/components/organisms/OverviewPanel/index'
import { chaptersPageCss } from './css'

// Esta é a tela principal de escrita: lista de capítulos + editor +
// copiloto de IA + visão geral, lado a lado, igual ao Figma.
export function ChaptersPage() {
  return (
    <div className={chaptersPageCss.root}>
      <ChapterListPanel />
      <EditorPanel />
      <CopilotPanel />
      <OverviewPanel />
    </div>
  )
}
