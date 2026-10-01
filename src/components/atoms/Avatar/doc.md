# Avatar

## Como funciona

Círculo do usuário. Mostra a imagem de `imageUrl`; sem imagem (ou com link quebrado), mostra a inicial de `name`.

- `index.tsx`: implementação principal.
- `type.ts`: tipos públicos do componente.
- `css.ts`: nomes de classes usados pelo componente, exportados como constante.
- `doc.md`: documentação rápida de uso.

## Exemplo de import

```tsx
import { Avatar } from '@/components/atoms/Avatar'

<Avatar name="Rebecca" imageUrl={user.photoURL} size={64} />
```
