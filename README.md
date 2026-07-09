# Livro App

Software de escrita de livros, com IA (Gemini) para revisão gramatical e sugestão de ideias.

## Como rodar

```bash
npm install
cp .env.example .env   # depois preencha suas chaves do Firebase e do Gemini
npm run dev
```

## Onde conseguir as chaves

- **Firebase**: crie um projeto em https://console.firebase.google.com, ative
  **Authentication** (método Email/Senha) e **Firestore Database**. As chaves
  ficam em "Configurações do projeto > Seus apps > SDK setup".
- **Gemini**: gere uma chave em https://aistudio.google.com/apikey

## Estrutura do projeto (Atomic Design)

```
src/
  components/
    atoms/        -> menor peça reutilizável (Button, Input, Label)
    molecules/     -> junta átomos (FormField = Label + Input)
    organisms/     -> peça completa de UI (Sidebar, AiAssistPanel)
    templates/     -> esqueleto de página (ProjectLayout)
  pages/           -> telas de fato (LoginPage, DashboardPage, abas do projeto)
  store/           -> estado global (Zustand)
  services/
    firebase.ts    -> conexão com Firebase (auth, firestore, storage)
    ai/            -> abstração da IA (hoje: Gemini)
  types/           -> tipos TS compartilhados (BookProject, Chapter, etc)
  router/          -> definição de rotas
```

## Próximos passos sugeridos

1. Configurar o Firebase de verdade e testar o login
2. Criar a lógica de capítulos (criar, editar, reordenar) na ChaptersTab
3. Evoluir Personagens/Locais/Timeline seguindo o mesmo padrão de DashboardPage
   (Firestore + useState/useEffect ou zustand)
4. Trocar o `<textarea>` do editor por um editor rico (Tiptap ou Lexical)
5. Adicionar upload de imagens (Firebase Storage) na ImagesTab
