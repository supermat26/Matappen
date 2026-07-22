import { getOppskrifter } from '@/lib/oppskrifter'
import type { Oppskrift } from '@/lib/oppskrifter'
import Link from 'next/link'

export default async function AlleOppskrifterPage() {
  const oppskrifter = await getOppskrifter()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📚 Alle oppskrifter ({oppskrifter.length})
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <h2 className="text-xl font-semibold text-gray-800">
                {oppskrift.tittel}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
                  {oppskrift.kategori}
                </span>
                <span className="text-sm text-gray-500">
                  ⏱ {oppskrift.prep_time || 30} min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}