import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// #region Tipos
type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}
// #endregion

// #region Contexto
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
// #endregion

// #region Provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  // lê o tema salvo no navegador, ou cai no claro por padrão
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('maibook-theme')
    return saved === 'dark' ? 'dark' : 'light'
  })

  // toda vez que o tema muda, aplica no <html> e salva a escolha
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('maibook-theme', theme)
  }, [theme])

  // alterna entre claro e escuro
  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  )
}
// #endregion

// #region Hook de acesso
export function useTheme() {
  const context = useContext(ThemeContext)
  // garante que o hook só seja usado dentro do ThemeProvider
  if (!context) throw new Error('useTheme precisa estar dentro de um <ThemeProvider>')
  return context
}
// #endregion
