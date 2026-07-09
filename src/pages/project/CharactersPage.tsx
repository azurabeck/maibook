import { SubsectionPage } from '@/components/molecules/SubsectionPage'

// Aba "Personagens": fichas, relações e aparições ao longo da história
export function CharactersPage() {
  return (
    <SubsectionPage
      title="Personagens"
      sections={[
        'Detalhes de personagens',
        'Conexões de personagens',
        'Resumo personagem por capítulo',
      ]}
    />
  )
}
