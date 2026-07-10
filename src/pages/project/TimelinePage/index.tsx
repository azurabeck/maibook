import { SubsectionPage } from '@/components/molecules/SubsectionPage/index'
import { timelinePageSections } from './type'

export function TimelinePage() {
  return <SubsectionPage title="Timeline" sections={timelinePageSections} />
}
