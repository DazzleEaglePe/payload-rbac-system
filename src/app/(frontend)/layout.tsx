import React from 'react'
import './styles.css'
import { AuthProvider } from '../../features/auth/context/AuthProvider'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  description: 'Aplicación RBAC de Inventario',
  title: 'Dashboard RBAC',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background antialiased text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <AuthProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
