// "Contrato" que qualquer provedor de IA precisa seguir.
// Isso é um conceito muito usado em TS: programar contra uma
// interface, não contra uma implementação concreta.
export interface AiProvider {
  name: string
  reviewGrammar(text: string): Promise<string>
  suggestIdea(context: string): Promise<string>
}
