// app/page.tsx
//
// Este es el codigo que la IA escribio para hacer pasar los tests de tests.md.
// Solo el codigo necesario, ni mas ni menos.
//
// (Ejemplo del tutorial — no se ejecuta tal cual, ilustra el resultado final
// del ciclo Modo Estandar de Arnes para esta feature.)

const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/angel-aparicio92' },
  { name: 'TikTok', url: 'https://tiktok.com/@iamasters.angel' },
  { name: 'Instagram', url: 'https://instagram.com/iamasters.angel' },
];

const RESERVA_URL = 'https://cal.com/angel-aparicio/llamada-30min';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl text-center space-y-8">

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
          Angel Aparicio
        </h1>

        <p className="text-lg md:text-xl text-slate-600">
          Formador de IA. Construyo automatizaciones y comunidades alrededor
          de la inteligencia artificial.
        </p>

        <div className="pt-4">
          <a
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-colors"
          >
            Reservar llamada
          </a>
        </div>

        <nav className="pt-8 flex justify-center gap-6 text-sm">
          {SOCIAL_LINKS.map(({ name, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              {name}
            </a>
          ))}
        </nav>

      </div>
    </main>
  );
}
