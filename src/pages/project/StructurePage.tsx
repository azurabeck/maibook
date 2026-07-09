import { SubsectionPage } from '@/components/molecules/SubsectionPage'

// Aba "Estruturas": tudo que define o "esqueleto" do livro como produto
export function StructurePage() {
  return (
    <SubsectionPage
      title="Estruturas"
      sections={['Cabeçalho', 'Footer', 'Sinopse', 'Capa', 'Resumo orelha 1', 'Resumo orelha 2']}
    />
  )
}
