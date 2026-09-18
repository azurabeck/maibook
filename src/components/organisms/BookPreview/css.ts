import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('book-preview-organism-css', `
.book-preview__trigger{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer}.book-preview__trigger:hover{border-color:var(--border-strong);color:var(--text-primary)}
.book-preview__overlay{position:fixed;inset:0;z-index:90;display:flex;flex-direction:column;background:rgba(12,13,18,.82);backdrop-filter:blur(5px)}
.book-preview__topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.13);background:rgba(20,21,27,.94);color:#fff}.book-preview__title{display:flex;align-items:center;gap:11px}.book-preview__title h2{margin:0;font-size:15px}.book-preview__title span{color:rgba(255,255,255,.58);font-size:11px}.book-preview__topbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}.book-preview__download{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(255,255,255,.08);color:#fff;font-size:11px;font-weight:700;cursor:pointer}.book-preview__download:hover:not(:disabled){background:rgba(255,255,255,.14)}.book-preview__download:disabled{opacity:.55;cursor:not-allowed}.book-preview__spinner{animation:book-preview-spin .8s linear infinite}@keyframes book-preview-spin{to{transform:rotate(360deg)}}
.book-preview__close{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:transparent;color:#fff;cursor:pointer}
.book-preview__viewport{flex:1;min-height:0;overflow:auto;padding:42px 24px 80px}.book-preview__book{display:flex;flex-direction:column;align-items:center;gap:32px}
.book-preview__page{position:relative;box-sizing:border-box;flex:0 0 auto;background:#fffdf8;color:#211f1b;box-shadow:0 18px 65px rgba(0,0,0,.36);overflow:hidden}.book-preview__header{margin-bottom:6mm}.book-preview__content{white-space:normal;overflow:hidden;overflow-wrap:break-word;column-fill:auto}.book-preview__content p{break-inside:avoid-column;margin-top:0}.book-preview__page-number{position:absolute;left:0;right:0;bottom:5mm;text-align:center;color:#81796e;font:9pt/1 Inter,sans-serif}.book-preview__footer-wrapper{position:absolute;color:#81796e}.book-preview__footer{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);align-items:end;gap:8px;line-height:1.25}.book-preview__footer>div{min-width:0;display:flex;align-items:flex-end;gap:6px}.book-preview__footer>div:nth-child(2){justify-content:center;text-align:center}.book-preview__footer>div:nth-child(3){justify-content:flex-end;text-align:right}.book-preview__footer span{overflow-wrap:anywhere}.book-preview__chapter-label{position:absolute;top:2.5mm;right:3mm;color:#aaa095;font:7px/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.book-preview__empty{display:flex;align-items:center;justify-content:center;min-height:50vh;color:rgba(255,255,255,.65)}
@media(max-width:800px){.book-preview__viewport{padding:24px 10px 60px}.book-preview__book{transform-origin:top center}.book-preview__page{max-width:calc(100vw - 20px)}}

/* @page fora de qualquer @media: zera a margem que o navegador impõe
   por padrão na impressão/PDF — sem isso, mesmo com o app pedindo
   página do tamanho exato do livro (A5, A4...), sobra uma margem
   branca ao redor porque o navegador ainda reserva a margem PADRÃO
   dele por fora. Assim a pessoa nem precisa lembrar de escolher
   "Margens: Nenhuma" na janela de impressão toda vez. */
@page{margin:0}

/* Impressão / "Salvar como PDF" nativo do navegador: some com tudo
   que não é página do livro e deixa cada página virar uma folha
   impressa (sem sombra, sem limite de scroll, uma por página física).
   O overlay é renderizado num portal direto em <body> (ver index.tsx)
   pra não ficar preso a nenhum container com overflow/height fixo do
   resto do app — por segurança as regras aqui também usam !important,
   já que CSS de impressão precisa vencer qualquer estilo de tela.
   print-color-adjust:exact força o navegador a imprimir cor/imagem de
   fundo mesmo com "Gráficos de segundo plano" desligado (padrão do
   Chrome) — sem isso, a capa (texto claro sobre fundo escuro/imagem)
   sai em branco: o fundo some e o texto claro fica invisível sobre o
   papel branco. #root com display:none é o que realmente evita a
   primeira página em branco: só esconder com visibility (como as
   regras abaixo já faziam) não tira o #root do fluxo do documento —
   ele continua ocupando a altura normal dele (o app inteiro atrás do
   modal), empurrando o conteúdo visível pra baixo e criando página(s)
   em branco antes da capa. display:none remove ele do layout de vez. */
@media print{
  #root{display:none!important}
  body *{visibility:hidden!important}
  .book-preview__overlay,.book-preview__overlay *{visibility:visible!important}
  .book-preview__overlay{position:static!important;inset:auto!important;display:block!important;height:auto!important;background:none!important;backdrop-filter:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact}
  .book-preview__topbar{display:none!important}
  .book-preview__viewport{display:block!important;overflow:visible!important;height:auto!important;padding:0!important}
  .book-preview__book{display:block!important;gap:0!important}
  .book-preview__page{box-shadow:none!important;break-after:page;page-break-after:always;margin:0 auto!important;max-width:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact}
  .book-preview__page:last-child{break-after:auto;page-break-after:auto}
}
`)

export const bookPreviewCss = {
  trigger:'book-preview__trigger', overlay:'book-preview__overlay', topbar:'book-preview__topbar', title:'book-preview__title', topbarActions:'book-preview__topbar-actions', download:'book-preview__download', spinner:'book-preview__spinner', close:'book-preview__close', viewport:'book-preview__viewport', book:'book-preview__book', page:'book-preview__page', header:'book-preview__header', content:'book-preview__content', pageNumber:'book-preview__page-number', footerWrapper:'book-preview__footer-wrapper', footer:'book-preview__footer', chapterLabel:'book-preview__chapter-label', empty:'book-preview__empty',
} as const
