import { getOppskrifterByKategori } from '@/lib/oppskrifter'
import type { Oppskrift } from '@/lib/oppskrifter'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    slug: string
  }
}

const kategoriIkoner: Record<string, string> = {
  middag: '🍝',
  lunsj: '🥪',
  frokost: '🥞',
  suppe: '🥣',
  vegetar: '🥗',
  dessert: '🍰',
  annet: '🍕'
}

export default async function KategoriPage({ params }: Props) {
  const oppskrifter = await getOppskrifterByKategori(params.slug)

  if (oppskrifter.length === 0) {
    notFound()
  }

  const kategoriNavn = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)
  const ikon = kategoriIkoner[params.slug] || '🍽️'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/kategorier"
          className="inline-block mb-4 text-red-600 hover:text-red-700"
        >
          ← Tilbake til kategorier
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{ikon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {kategoriNavn}
            </h1>
            <p className="text-gray-600 mt-1">
              {oppskrifter.length} oppskrift(er) i denne kategorien
            </p>
          </div>
        </div>
      </div>

      {/* Oppskrifter */}
      {oppskrifter.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">Ingen oppskrifter i denne kategorien</p>
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
                <h2 className="text-xl font-semibold text-gray-800">
                  {oppskrift.tittel}
                </h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {oppskrift.beskrivelse}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>⏱ {oppskrift.prep_time || 30} min</span>
                  <span>👥 {oppskrift.porsjoner || 4} porsjoner</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}