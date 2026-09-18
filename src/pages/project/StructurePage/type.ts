export const structurePageSections = ['Cabeçalho', 'Grid', 'Footer', 'Sinopse', 'Capa', 'Sumário', 'Resumo orelha 1', 'Resumo orelha 2'] as const

export type StructurePageSection = (typeof structurePageSections)[number]
