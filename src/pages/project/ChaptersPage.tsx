import { ChapterListPanel } from '@/components/organisms/ChapterListPanel'
import { EditorPanel } from '@/components/organisms/EditorPanel'
import { CopilotPanel } from '@/components/organisms/CopilotPanel'
import { OverviewPanel } from '@/components/organisms/OverviewPanel'

// Esta é a tela principal de escrita: lista de capítulos + editor +
// copiloto de IA + visão geral, lado a lado, igual ao Figma.
export function ChaptersPage() {
  return (
    <div className="chapters-page">
      <ChapterListPanel />
      <EditorPanel />
      <CopilotPanel />
      <OverviewPanel />
    </div>
  )
}
