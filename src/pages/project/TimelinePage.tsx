import { SubsectionPage } from '@/components/molecules/SubsectionPage'

// Aba "Timeline": ordena eventos em diferentes escalas de tempo
export function TimelinePage() {
  return (
    <SubsectionPage
      title="Timeline"
      sections={['Timeline dos capítulos', 'Timeline dos personagens', 'Timeline da história']}
    />
  )
}
