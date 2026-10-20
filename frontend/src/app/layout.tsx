import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PUENTE - Accesibilidad en la Justicia',
  description: 'De la citación a la sentencia, a tu manera',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="marco">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 btn-primary"
        >
          Ir al contenido principal
        </a>
        {children}
      </body>
    </html>
  )
}
