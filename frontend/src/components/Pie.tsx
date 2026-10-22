export function Pie() {
  return (
    <footer className="mt-8 py-8 border-t border-accent-info/20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-10 text-court-700 text-sm">
        <p className="mb-2 text-accent-navy font-medium">TribunalInclusivo · DATAthon Justicia 2026</p>
        <p>
          Pictogramas:{' '}
          <a
            href="https://arasaac.org"
            className="underline underline-offset-2 text-accent-navy decoration-accent-info/40 transition-colors duration-200 hover:text-accent-info hover:decoration-accent-info"
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
