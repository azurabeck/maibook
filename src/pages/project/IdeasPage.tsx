import { SubsectionPage } from '@/components/molecules/SubsectionPage'

// Aba "Ideias": bloco de notas livre pra história e personagens
export function IdeasPage() {
  return (
    <SubsectionPage title="Ideias" sections={['Notas da história', 'Notas para personagem']} />
  )
}
