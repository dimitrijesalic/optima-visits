import type { Metadata } from 'next'
import { Roboto, Montserrat } from 'next/font/google'
import type React from 'react'
import './globals.css'
import { Providers } from '@/src/app/providers'

const roboto = Roboto({ subsets: ['latin', 'latin-ext'], variable: '--font-roboto' })
const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: 'Optima',
  description: 'Optima',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <body className={`${roboto.variable} ${montserrat.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
