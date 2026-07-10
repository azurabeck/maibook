# DashboardPage

## Como funciona

Página `DashboardPage` organizada no mesmo padrão dos components.

- `index.tsx`: implementação principal da página.
- `type.ts`: tipos públicos/locais da página.
- `css.ts`: nomes de classes usados pela página, exportados como constante.
- `doc.md`: documentação rápida de uso.

Estilos específicos ficam no `css.ts` desta pasta. O `global.css` fica apenas com reset/tema/utilitário genérico.

## Exemplo de import

```tsx
import { DashboardPage } from '@/pages/DashboardPage'
```
