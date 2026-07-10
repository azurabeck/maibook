import { SubsectionPage } from '@/components/molecules/SubsectionPage/index'
import { structurePageSections } from './type'

export function StructurePage() {
  return <SubsectionPage title="Estruturas" sections={structurePageSections} />
}
