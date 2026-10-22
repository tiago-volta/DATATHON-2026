import { QRCodeSVG } from 'qrcode.react'
import { Icono } from '@/components/Icono'
import { Marca } from '@/components/Marca'

interface AjusteFicha {
  id: string
  nombre: string
}

interface FichaAjustesProps {
  nombre: string
  ajustes: AjusteFicha[]
  contacto: string
  url: string
  avisoCopia: string
  onCopiar: () => void
  onNueva: () => void
}

export function FichaAjustes({
  nombre,
  ajustes,
  contacto,
  url,
  avisoCopia,
  onCopiar,
  onNueva,
}: FichaAjustesProps) {
  return (
    <section>
      <h1 className="titulo-pagina text-center">Tu ficha de ajustes</h1>
      <p className="entradilla text-center max-w-md mx-auto">
        Muestra esta ficha. Quien te atiende escanea el código y abre tus ajustes en su móvil.
      </p>

      <article className="hoja hoja-imprimible max-w-md mx-auto">
        <header className="border-b-2 border-court-800 pb-6 mb-6">
          <div className="flex items-center gap-3 mb-4 text-court-800">
            <Marca className="w-8 h-8" />
            <span className="text-xl font-bold" translate="no">TribunalInclusivo</span>
          </div>
          <p className="text-3xl font-bold text-court-900 mb-1">{nombre}</p>
          <p className="text-court-700">Pasaporte de Ajustes</p>
        </header>

        <h2 className="font-bold text-court-800 mb-3">Necesitas:</h2>
        <ul className="space-y-2 mb-6">
          {ajustes.map((ajuste) => (
            <li key={ajuste.id} className="flex items-start gap-2">
              <Icono nombre="✓" className="mt-1 h-5 w-5 text-accent-success" />
              <span className="text-court-700">{ajuste.nombre}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-center">
          <div className="w-full max-w-[280px] bg-white p-4 rounded-suave border border-court-200">
            {url && (
              <QRCodeSVG
                value={url}
                size={280}
                level="M"
                fgColor="#1d1d1f"
                bgColor="#ffffff"
                className="h-auto w-full"
                aria-label={`Código QR de la ficha de ${nombre}`}
              />
            )}
          </div>
        </div>

        {contacto && (
          <div className="border-t border-court-200 pt-4 mt-6">
            <p className="text-sm text-court-700">
              <strong>Contacto de emergencia:</strong> {contacto}
            </p>
          </div>
        )}

        <p className="border-t border-court-200 pt-4 mt-6 text-court-800">
          Esta ficha no muestra ningún diagnóstico. Solo indica qué adaptaciones necesitas.
        </p>
        <p className="mt-2 text-sm text-court-700">
          Base legal: artículo 7 bis de la Ley de Enjuiciamiento Civil, artículos 109 y 118 de la Ley de Enjuiciamiento Criminal, y Ley 15/2022.
        </p>
      </article>

      <div className="no-imprimir flex flex-col gap-3 mt-8 max-w-md mx-auto">
        <p className="sr-only" aria-live="polite">
          {avisoCopia}
        </p>
        <button type="button" onClick={onCopiar} className="btn-secondary w-full">
          {avisoCopia === 'Enlace copiado.' ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
        <button type="button" onClick={() => window.print()} className="btn-ghost w-full">
          Imprimir o guardar
        </button>
        <button type="button" onClick={onNueva} className="btn-ghost w-full">
          Crear otra ficha
        </button>
      </div>
    </section>
  )
}
