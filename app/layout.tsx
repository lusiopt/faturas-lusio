import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Faturas Lusio - Reconciliação de Pagamentos',
  description: 'Sistema de reconciliação de pagamentos Stripe com clientes Lusio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
