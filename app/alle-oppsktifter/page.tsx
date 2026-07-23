import { getOppskrifter } from '@/lib/oppskrifter'
import type { Oppskrift } from '@/lib/oppskrifter'
import Link from 'next/link'

export default async function AlleOppskrifterPage() {
  const oppskrifter = await getOppskrifter()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📚 Alle oppskrifter</h1>
        <span className="text-sm text-gray-500">{oppskrifter.length} oppskrifter</span>
      </div>

      {oppskrifter.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">Ingen oppskrifter funnet</p>
          <p className="text-gray-500 text-sm mt-2">Har du lagt til oppskrifter i databasen?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {oppskrifter.map((oppskrift: Oppskrift) => (
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
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {oppskrift.tittel}
                </h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {oppskrift.beskrivelse}
                </p>
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                    {oppskrift.kategori}
                  </span>
                  <span>⏱ {oppskrift.prep_time || 30} min</span>
                  <span>👥 {oppskrift.porsjoner || 4}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tilbake-knapp */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Tilbake til forsiden
        </Link>
      </div>
    </div>
  )
}