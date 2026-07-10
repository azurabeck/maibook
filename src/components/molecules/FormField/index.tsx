import { Label } from '@/components/atoms/Label/index'
import { Input } from '@/components/atoms/Input/index'
import type { FormFieldProps } from './type'
import { formFieldCss } from './css'

// Uma MOLÉCULA junta 2+ átomos pra formar algo com um propósito
// pequeno e claro: aqui, um campo de formulário completo
// (label + input associados pelo "id").


export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  return (
    <div className={formFieldCss.formField}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}
