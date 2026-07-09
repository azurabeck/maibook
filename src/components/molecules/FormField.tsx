import { Label } from '@/components/atoms/Label'
import { Input } from '@/components/atoms/Input'
import type { InputHTMLAttributes } from 'react'

// Uma MOLÉCULA junta 2+ átomos pra formar algo com um propósito
// pequeno e claro: aqui, um campo de formulário completo
// (label + input associados pelo "id").

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="form-field">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}
