import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db, auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button'
import type { BookProject } from '@/types'

export function DashboardPage() {
  const [projects, setProjects] = useState<BookProject[]>([])
  const navigate = useNavigate()

  // useEffect roda um "efeito colateral" (side effect) — aqui,
  // assinar os dados do Firestore em tempo real. O array vazio
  // "[]" no final significa "rode isso só uma vez, quando o
  // componente aparece na tela".
  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const q = query(collection(db, 'projects'), where('ownerId', '==', uid))

    // onSnapshot "escuta" mudanças nos dados em tempo real e chama
    // essa função toda vez que algo muda no Firestore.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as BookProject,
      )
      setProjects(data)
    })

    // Isso que é retornado é a função de "limpeza" (cleanup):
    // roda quando o componente sai da tela, pra parar de escutar
    // o Firestore e evitar vazamento de memória.
    return () => unsubscribe()
  }, [])

  async function handleCreateProject() {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const newProject: Omit<BookProject, 'id'> = {
      ownerId: uid,
      title: 'Novo livro sem título',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const docRef = await addDoc(collection(db, 'projects'), newProject)
    navigate(`/projeto/${docRef.id}/capitulos`)
  }

  return (
    <div className="dashboard-page">
      <header>
        <h1>Meus livros</h1>
        <Button onClick={handleCreateProject}>+ Novo projeto</Button>
      </header>

      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button onClick={() => navigate(`/projeto/${project.id}/capitulos`)}>
              {project.title}
            </button>
          </li>
        ))}
      </ul>

      {projects.length === 0 && <p>Você ainda não tem nenhum projeto. Crie o primeiro!</p>}
    </div>
  )
}
