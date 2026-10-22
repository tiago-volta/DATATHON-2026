export function Pie() {
  return (
    <footer className="mt-8 py-8 border-t border-accent-info/20 bg-calma-mist/40">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-10 text-court-700 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-lg object-contain" />
          <p className="text-accent-navy font-bold">
            <span className="text-slate-800">Tribunal</span>
            <span className="text-[#0f766e]">Inclusivo</span>
            <span className="text-xs font-normal text-court-600 block sm:inline sm:ml-2">· DATAthon Justicia 2026</span>
          </p>
        </div>
        <p className="text-xs text-court-600">
          Pictogramas:{' '}
          <a
            href="https://arasaac.org"
            className="underline underline-offset-2 text-accent-navy decoration-accent-info/40 transition-colors duration-200 hover:text-accent-info"
            target="_blank"
            rel="noopener noreferrer"
          >
            ARASAAC
          </a>
          , Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
        </p>
      </div>
    </footer>
  )
}
