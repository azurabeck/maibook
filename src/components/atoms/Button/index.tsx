import type { ButtonProps } from './type'
import { buttonCss } from './css'

// #region Componente
// Em Atomic Design, um ÁTOMO é o menor bloco reutilizável possível:
// um botão, um input, um label. Não tem lógica de negócio, só recebe
// props e exibe algo.
export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  const variantClass = variant === 'primary' ? buttonCss.primary : buttonCss.secondary

  return <button className={`${buttonCss.root} ${variantClass} ${className}`} {...rest} />
}
// #endregion
