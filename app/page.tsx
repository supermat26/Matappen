import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

// Ikoner for kategorier
const kategoriIkoner: Record<string, string> = {
  middag: '🍝',
  lunsj: '🥪',
  frokost: '🥞',
  suppe: '🥣',
  vegetar: '🥗',
  dessert: '🍰',
  annet: '🍕'
}

export default async function Home() {
  // Hent alle oppskrifter direkte
  const { data: oppskrifter, error } = await supabase
    .from('oppskrifter')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('📊 Antall oppskrifter:', oppskrifter?.length || 0)
  console.log('❌ Eventuell feil:', error)

  // Hent unike kategorier
  const kategorier: string[] = []
  oppskrifter?.forEach((opp) => {
    if (!kategorier.includes(opp.kategori)) {
      kategorier.push(opp.kategori)
    }
  })

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
        {kategorier.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kategorier.map((kategori) => (
              <Link
                key={kategori}
                href={`/kategorier/${kategori}`}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:border-red-500 hover:shadow-lg transition-all active:scale-95"
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
        ) : (
          <p className="text-gray-500">Ingen kategorier funnet</p>
        )}
      </section>

      {/* Siste oppskrifter */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🔥 Siste oppskrifter</h2>
        {oppskrifter && oppskrifter.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oppskrifter.slice(0, 6).map((oppskrift) => (
                <Link
                  key={oppskrift.id}
                  href={`/oppskrifter/${oppskrift.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow active:scale-[0.98]"
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
                    <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
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
            {oppskrifter.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/alle-oppskrifter"
                  className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors active:bg-red-800"
                >
                  Se alle {oppskrifter.length} oppskrifter →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">Ingen oppskrifter funnet</p>
            <p className="text-gray-500 text-sm mt-2">
              Har du lagt til oppskrifter i databasen?
            </p>
          </div>
        )}
      </section>
    </div>
  )
}