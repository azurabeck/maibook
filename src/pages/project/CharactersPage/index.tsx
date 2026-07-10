import { SubsectionPage } from '@/components/molecules/SubsectionPage/index'
import { charactersPageSections } from './type'

export function CharactersPage() {
  return <SubsectionPage title="Personagens" sections={charactersPageSections} />
}
