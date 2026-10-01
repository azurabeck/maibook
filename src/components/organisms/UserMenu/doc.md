# UserMenu

## Como funciona

Avatar do cabeçalho que abre o menu da conta: **Meu perfil** (`/perfil`), **Configurações** (`/configuracoes`) e **Sair** (desloga e volta pro login). Lê o usuário de `useAuthStore`.

- `index.tsx`: implementação principal.
- `type.ts`: tipos públicos do componente.
- `css.ts`: nomes de classes usados pelo componente, exportados como constante.
- `doc.md`: documentação rápida de uso.

## Exemplo de import

```tsx
import { UserMenu } from '@/components/organisms/UserMenu'
```
