'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { NivelSala, ValoresEstimulo } from '@/lib/sala-previa/tipos'

interface Props {
  nivel: NivelSala
  valores: ValoresEstimulo
  enCalma: boolean
}

function Siluetas({ cantidad, reduced }: { cantidad: number; reduced: boolean }) {
  const items = Array.from({ length: cantidad }, (_, i) => i)
  return (
    <div className="absolute inset-x-0 bottom-0 h-2/5 flex items-end justify-around px-6 pointer-events-none" aria-hidden="true">
      {items.map((i) => (
        <div
          key={i}
          className="bg-puente-800/40 rounded-t-full"
          style={{
            width: `${18 + (i % 3) * 6}px`,
            height: `${48 + (i % 4) * 10}px`,
            opacity: 0.35 + (i % 5) * 0.08,
            transition: reduced ? 'opacity 0.8s ease-out' : 'opacity 2.2s ease-out, transform 2.2s ease-out',
            transform: reduced ? undefined : `translateY(${(i % 2) * 4}px)`,
          }}
        />
      ))}
    </div>
  )
}

export function EscenaSensorial({ nivel, valores, enCalma }: Props) {
  const reduced = useReducedMotion()
  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido
  const eco = enCalma ? 0 : valores.eco

  const brilloBase = 92 - luz * 0.35
  const overlayLuz = Math.max(0, (luz - 40) / 100)
  const flicker = !reduced && luz > 70
  const siluetas = Math.min(12, Math.floor(gente / 8))

  return (
    <div
      className="aspect-video rounded-tarjeta relative overflow-hidden border border-puente-200"
      role="img"
      aria-label={`Vista de la sala: ${nivel.nombre}. Ruido ${Math.round(ruido)}, luz ${Math.round(luz)}, gente ${Math.round(gente)}, eco ${Math.round(eco)}.`}
      style={{
        background: `linear-gradient(180deg, hsl(200, 18%, ${brilloBase}%) 0%, hsl(195, 14%, ${brilloBase - 8}%) 100%)`,
        transition: reduced
          ? 'background 0.8s ease-out'
          : 'background 2.2s ease-out',
      }}
    >
      {/* Fluorescent overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${flicker ? 'sala-flicker' : ''}`}
        style={{
          background: `radial-gradient(ellipse at top, rgba(255,255,220,${0.15 + overlayLuz * 0.45}) 0%, transparent 55%)`,
          opacity: 0.3 + overlayLuz,
          transition: reduced ? 'opacity 0.8s ease-out' : 'opacity 2.2s ease-out',
        }}
        aria-hidden="true"
      />

      {/* Courtroom furniture suggestion */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6" aria-hidden="true">
        <div
          className="w-3/5 h-3 rounded-sm bg-puente-700/30 mb-8"
          style={{ opacity: 0.4 + gente / 200 }}
        />
        <div className="flex gap-8 w-4/5 justify-between mb-10">
          <div className="w-1/3 h-2 rounded-sm bg-puente-600/25" />
          <div className="w-1/3 h-2 rounded-sm bg-puente-600/25" />
        </div>
        <p className="text-xl font-bold text-puente-800 text-center relative z-10">
          {nivel.nombre}
        </p>
        <p className="text-puente-600 text-center max-w-md mt-2 relative z-10">
          {nivel.descripcion}
        </p>
      </div>

      {siluetas > 0 && <Siluetas cantidad={siluetas} reduced={reduced} />}

      {/* Ambient density veil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `rgba(30, 58, 95, ${Math.min(0.35, (ruido + eco) / 400)})`,
          transition: reduced ? 'background 0.8s ease-out' : 'background 2.2s ease-out',
        }}
        aria-hidden="true"
      />

      {enCalma && (
        <div className="absolute top-3 left-3 right-3 text-center">
          <span className="inline-block bg-white/90 text-puente-800 font-bold px-4 py-2 rounded-suave text-sm">
            Modo calma activo
          </span>
        </div>
      )}
    </div>
  )
}
