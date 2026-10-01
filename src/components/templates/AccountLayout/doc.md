# AccountLayout

## Como funciona

Template das páginas da conta (`/perfil`, `/configuracoes`): cabeçalho com logo, abas, tema e `UserMenu`, e a rota filha no `<Outlet />`. Redireciona pro login quem não está autenticado.

O `css.ts` também exporta os blocos visuais (`card`, `cardLabel`, `cardActions`, `feedback`...) reaproveitados pelas páginas de conta.

- `index.tsx`: implementação principal.
- `type.ts`: tipos públicos do componente.
- `css.ts`: nomes de classes usados pelo componente, exportados como constante.
- `doc.md`: documentação rápida de uso.

## Exemplo de import

```tsx
import { AccountLayout } from '@/components/templates/AccountLayout'
```
