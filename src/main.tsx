import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles/theme.css'
import './styles/global.css'

// Isso aqui é o "ponto de partida" de TODA aplicação React.
// O ReactDOM pega o componente <App /> e renderiza ele
// dentro da <div id="root"> que existe no index.html.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* ThemeProvider por fora de tudo: qualquer componente do app
        pode usar useTheme() pra saber/mudar claro-escuro */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
