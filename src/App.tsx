import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

// App.tsx é o componente "raiz". Aqui ele só entrega o controle
// de navegação pro RouterProvider — o resto da lógica vive em
// router/index.tsx e nas páginas.
function App() {
  return <RouterProvider router={router} />
}

export default App
