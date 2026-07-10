import { useProjectStore } from '@/store/useProjectStore'
import { AiAssistPanel } from '@/components/organisms/AiAssistPanel/index'
import { writeTabCss } from './css'

// Nesta primeira versão, o "editor" é só um <textarea> — depois,
// quando você quiser, trocamos por um editor rico de verdade
// (Tiptap ou Lexical). A ideia agora é você entender o fluxo de
// dados: state global (zustand) -> componente -> IA -> state global.
export function WriteTab() {
  const { chapters, activeChapterId, updateChapterContent } = useProjectStore()

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)

  if (!activeChapter) {
    return <p>Selecione ou crie um capítulo na aba "Capítulos" para começar a escrever.</p>
  }

  return (
    <div className={writeTabCss.root}>
      <h2>{activeChapter.title}</h2>

      <textarea
        className={writeTabCss.editor}
        value={activeChapter.content}
        onChange={(e) => updateChapterContent(activeChapter.id, e.target.value)}
        rows={20}
      />

      <div className={writeTabCss.aiTools}>
        <AiAssistPanel contextText={activeChapter.content} mode="grammar" />
        <AiAssistPanel contextText={activeChapter.content} mode="idea" />
      </div>
    </div>
  )
}
