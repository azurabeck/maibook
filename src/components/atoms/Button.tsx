import type { ButtonHTMLAttributes } from 'react'

// Em Atomic Design, um ÁTOMO é o menor bloco reutilizável possível:
// um botão, um input, um label. Não tem lógica de negócio, só recebe
// props e exibe algo.

// Estendemos os atributos nativos de <button> (onClick, disabled, etc.)
// e adicionamos uma prop customizada "variant".
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} ${className}`}
      // "...rest" espalha (spread) todas as outras props recebidas
      // (onClick, disabled, type, children etc) direto no <button>
      {...rest}
    />
  )
}
