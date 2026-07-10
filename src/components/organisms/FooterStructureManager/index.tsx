import { useEffect, useState } from 'react'
import { FileDown, Pencil, Plus, Trash2, X } from 'lucide-react'
import { createFooterStructure, deleteFooterStructure, subscribeToFooterStructures, updateFooterStructure } from '@/services/firestore/footerStructures'
import type { FooterElementType, FooterPosition, FooterStructure, FooterStructureDraft, FooterStructureLayout } from '@/types'
import { footerStructureManagerCss as css } from './css'

const layouts: { value: FooterStructureLayout; label: string; items: FooterElementType[] }[] = [
  { value: 'number', label: 'Só número', items: ['page-number'] },
  { value: 'note-number', label: 'Nota de rodapé · número', items: ['note', 'page-number'] },
  { value: 'note-chapter-number', label: 'Nota · capítulo · número', items: ['note', 'chapter-title', 'page-number'] },
  { value: 'chapter-number', label: 'Nome do capítulo · número', items: ['chapter-title', 'page-number'] },
]
const positions: { value: FooterPosition; label: string }[] = [{ value:'left',label:'Esquerda'},{value:'center',label:'Centro'},{value:'right',label:'Direita'}]
const labels: Record<FooterElementType,string> = { note:'Nota de rodapé', 'chapter-title':'Nome do capítulo', 'page-number':'Número da página' }
const defaultDraft: FooterStructureDraft = { name:'Footer padrão', layout:'number', noteText:'', items:[{type:'page-number',position:'center'}], fontFamily:'Inter, sans-serif', fontSize:9, borderTop:false, spacingTop:8 }

function itemsFor(layout: FooterStructureLayout, current: FooterStructureDraft['items']) {
  const required = layouts.find(item => item.value === layout)?.items ?? []
  return required.map((type, index) => ({ type, position: current.find(item => item.type === type)?.position ?? (required.length === 1 ? 'center' : index === 0 ? 'left' : index === required.length - 1 ? 'right' : 'center') }))
}
function Preview({ draft }: { draft: FooterStructureDraft }) {
  return <div className={css.previewPage}><div className={css.previewText}>O conteúdo do capítulo ocupa a mancha gráfica da página. O rodapé permanece organizado na base da folha.</div><div className={css.previewFooter} style={{fontFamily:draft.fontFamily,fontSize:`${draft.fontSize}px`,paddingTop:draft.spacingTop,borderTop:draft.borderTop?'1px solid #d8d5df':'none'}}>{(['left','center','right'] as FooterPosition[]).map(position => <div key={position}>{draft.items.filter(item=>item.position===position).map(item=><span key={item.type}>{item.type==='note'?(draft.noteText||'Nota de rodapé'):item.type==='chapter-title'?'O Dragão e o Hipogrifo':'24'}</span>)}</div>)}</div></div>
}

export function FooterStructureManager({ projectId }: { projectId: string }) {
  const [structures,setStructures]=useState<FooterStructure[]>([])
  const [editing,setEditing]=useState<FooterStructure|null>(null)
  const [draft,setDraft]=useState<FooterStructureDraft>(defaultDraft)
  const [open,setOpen]=useState(false)
  const [saving,setSaving]=useState(false)
  useEffect(()=>subscribeToFooterStructures(projectId,setStructures),[projectId])
  const openEditor=(structure?:FooterStructure)=>{ setEditing(structure??null); setDraft(structure?{name:structure.name,layout:structure.layout,noteText:structure.noteText,items:structure.items,fontFamily:structure.fontFamily,fontSize:structure.fontSize,borderTop:structure.borderTop,spacingTop:structure.spacingTop}:defaultDraft); setOpen(true) }
  const setLayout=(layout:FooterStructureLayout)=>setDraft(current=>({...current,layout,items:itemsFor(layout,current.items)}))
  const setPosition=(type:FooterElementType,position:FooterPosition)=>setDraft(current=>({...current,items:current.items.map(item=>item.type===type?{...item,position}:item)}))
  const save=async()=>{ setSaving(true); try { editing?await updateFooterStructure(projectId,editing.id,draft):await createFooterStructure(projectId,draft); setOpen(false) } finally { setSaving(false) } }
  return <div className={css.root}>
    <div className={css.intro}><div><p className={css.introTag}><FileDown size={14}/> Estrutura editorial</p><h2 className={css.title}>Rodapés do livro</h2><p className={css.description}>Crie modelos de footer e escolha livremente onde número, nota e nome do capítulo aparecem.</p></div><button className={css.add} onClick={()=>openEditor()} title="Novo footer"><Plus size={22}/></button></div>
    {structures.length?<div className={css.cards}>{structures.map(structure=><article className={css.card} key={structure.id}><div className={css.cardPreview}><Preview draft={structure}/></div><div className={css.cardBody}><div><h3>{structure.name}</h3><p>{layouts.find(item=>item.value===structure.layout)?.label}</p></div><div className={css.actions}><button onClick={()=>openEditor(structure)}><Pencil size={15}/></button><button onClick={()=>deleteFooterStructure(projectId,structure.id)}><Trash2 size={15}/></button></div></div></article>)}</div>:<div className={css.empty}><FileDown size={28}/><h3>Nenhum footer criado</h3><p>Crie o primeiro modelo de rodapé do livro.</p></div>}
    {open&&<div className={css.overlay} onMouseDown={()=>setOpen(false)}><div className={css.editor} onMouseDown={event=>event.stopPropagation()}>
      <header className={css.header}><div><p className={css.eyebrow}>Estrutura de rodapé</p><h2>{editing?'Editar footer':'Novo footer'}</h2><p>Defina os elementos e escolha a posição de cada um.</p></div><button className={css.close} onClick={()=>setOpen(false)}><X size={18}/></button></header>
      <div className={css.content}><div className={css.controls}>
        <section className={css.section}><h3>1. Identificação e composição</h3><label className={css.field}>Nome do modelo<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><div className={css.layoutGrid}>{layouts.map(layout=><button className={draft.layout===layout.value?css.optionActive:css.option} onClick={()=>setLayout(layout.value)} key={layout.value}>{layout.label}</button>)}</div></section>
        <section className={css.section}><h3>2. Posição dos elementos</h3>{draft.items.map(item=><div className={css.positionRow} key={item.type}><strong>{labels[item.type]}</strong><div>{positions.map(position=><button className={item.position===position.value?css.positionActive:css.position} onClick={()=>setPosition(item.type,position.value)} key={position.value}>{position.label}</button>)}</div></div>)}</section>
        {draft.items.some(item=>item.type==='note')&&<section className={css.section}><h3>3. Nota de rodapé</h3><label className={css.field}>Texto da nota<input value={draft.noteText} onChange={e=>setDraft({...draft,noteText:e.target.value})} placeholder="Ex.: MAIBOOK · Edição 2026"/></label></section>}
        <section className={css.section}><h3>{draft.items.some(item=>item.type==='note')?'4':'3'}. Aparência</h3><div className={css.twoCols}><label className={css.field}>Fonte<select value={draft.fontFamily} onChange={e=>setDraft({...draft,fontFamily:e.target.value})}><option value="Inter, sans-serif">Inter</option><option value="Georgia, serif">Georgia</option><option value="'Times New Roman', serif">Times New Roman</option></select></label><label className={css.field}>Tamanho<input type="number" value={draft.fontSize} onChange={e=>setDraft({...draft,fontSize:Number(e.target.value)})}/></label></div><div className={css.twoCols}><label className={css.field}>Espaço superior<input type="number" value={draft.spacingTop} onChange={e=>setDraft({...draft,spacingTop:Number(e.target.value)})}/></label><button className={draft.borderTop?css.optionActive:css.option} onClick={()=>setDraft({...draft,borderTop:!draft.borderTop})}>Linha superior</button></div></section>
      </div><div className={css.previewArea}><p>Prévia do rodapé</p><Preview draft={draft}/></div></div>
      <footer className={css.footer}><button className={css.cancel} onClick={()=>setOpen(false)}>Cancelar</button><button className={css.save} disabled={!draft.name.trim()||saving} onClick={save}>{saving?'Salvando...':'Salvar footer'}</button></footer>
    </div></div>}
  </div>
}
