import type { InputProps } from './type'
import { inputCss } from './css'


export function Input(props: InputProps) {
  return <input className={inputCss.input} {...props} />
}
