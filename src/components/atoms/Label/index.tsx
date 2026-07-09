import type { LabelProps } from './type'
import { labelCss } from './css'


export function Label(props: LabelProps) {
  return <label className={labelCss.label} {...props} />
}
