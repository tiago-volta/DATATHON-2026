import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Cabecera } from '@/components/Cabecera'
import { Pie } from '@/components/Pie'
import { TutorialInicio } from '@/components/TutorialInicio'
import { OnboardingVoz } from '@/components/voz/OnboardingVoz'

export const metadata: Metadata = {
  title: 'InclusiveCourt - Accesibilidad en la Justicia',
  description: 'De la citación a la sentencia, a tu manera',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="marco flex min-h-screen flex-col">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[80] btn-primary"
        >
          Ir al contenido principal
        </a>
        <TutorialInicio />
        <OnboardingVoz />
        <Cabecera />
        <div className="flex-1">{children}</div>
        <Pie />
      </body>
    </html>
  )
}
