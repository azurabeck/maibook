export const structurePageSections = ['Cabeçalho', 'Grid', 'Footer', 'Sinopse', 'Capa', 'Resumo orelha 1', 'Resumo orelha 2'] as const

export type StructurePageSection = (typeof structurePageSections)[number]
