// Layout específico para el chat: sin padding-bottom extra, el ChatClient gestiona su propio espacio
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
