import { getKategorier, getOppskrifter } from '@/lib/oppskrifter'
import type { Oppskrift } from '@/lib/oppskrifter'
import Link from 'next/link'

// Ikoner for kategorier
const kategoriIkoner: Record<string, string> = {
  middag: '🍝',
  lunsj: '🥪',
  frokost: '🥞',
  suppe: '🥣',
  vegetar: '🥗',
  dessert: '🍰'
}

export default async function Home() {
  const kategorier = await getKategorier()
  const oppskrifter = await getOppskrifter()

  return (
    <div>
      {/* Hero-seksjon */}
      <section className="text-center py-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          🍳 Matappen
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Din personlige matlagingsassistent – steg for steg med bilder og opplesning
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Perfekt for nybegynnere, eldre, ungdom og personer med leseutfordringer
        </p>
      </section>

      {/* Kategorier */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">📂 Velg kategori</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kategorier.map((kategori) => (
            <Link
              key={kategori}
              href={`/kategorier/${kategori}`}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-red-500 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-2">
                {kategoriIkoner[kategori] || '🍽️'}
              </div>
              <div className="font-semibold text-gray-700 capitalize">
                {kategori}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Siste oppskrifter */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🔥 Siste oppskrifter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oppskrifter.slice(0, 6).map((oppskrift: Oppskrift) => (
            <Link
              key={oppskrift.id}
              href={`/oppskrifter/${oppskrift.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {oppskrift.bilde_url && (
                <div className="h-48 bg-gray-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={oppskrift.bilde_url}
                    alt={oppskrift.tittel}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {oppskrift.tittel}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {oppskrift.beskrivelse}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>⏱ {oppskrift.prep_time || 30} min</span>
                  <span>👥 {oppskrift.porsjoner || 4} porsjoner</span>
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                    {oppskrift.kategori}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
