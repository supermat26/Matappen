import { getOppskrifter } from '@/lib/oppskrifter'
import type { Oppskrift } from '@/lib/oppskrifter'
import Link from 'next/link'

interface Props {
  searchParams: {
    q: string
  }
}

export default async function SokPage({ searchParams }: Props) {
  const query = searchParams.q?.toLowerCase() || ''
  const alle = await getOppskrifter()
  
  const resultater = alle.filter((opp: Oppskrift) =>
    opp.tittel.toLowerCase().includes(query) ||
    opp.beskrivelse?.toLowerCase().includes(query) ||
    opp.kategori.toLowerCase().includes(query)
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        🔍 Søkeresultat: "{query}"
      </h1>
      <p className="text-gray-600 mb-6">
        Fant {resultater.length} oppskrift(er)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultater.map((oppskrift: Oppskrift) => (
          <Link
            key={oppskrift.id}
            href={`/oppskrifter/${oppskrift.id}`}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            {oppskrift.bilde_url && (
              <div className="h-48 bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={oppskrift.bilde_url}
                  alt={oppskrift.tittel}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {oppskrift.tittel}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {oppskrift.beskrivelse?.substring(0, 100)}...
              </p>
            </div>
          </Link>
        ))}
      </div>

      {resultater.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600">Fant ingen oppskrifter på "{query}"</p>
          <Link href="/" className="text-red-600 hover:underline mt-4 block">
            Gå tilbake til forsiden
          </Link>
        </div>
      )}
    </div>
  )
}