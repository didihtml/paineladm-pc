import type { Metadata } from 'next'
import './globals.css'
import './admin-theme.css'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { AppBackground } from '@/components/ui/AppBackground'

export const metadata: Metadata = {
  title: 'Painel PUC | Carteirinhas',
  description: 'Sistema administrativo de carteirinhas com portal público.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppBackground />
        <div className="app-content">{children}</div>
        <ToastProvider />
      </body>
    </html>
  )
}
