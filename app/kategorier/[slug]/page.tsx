import { getKategorier } from '@/lib/oppskrifter'
import Link from 'next/link'

const kategoriIkoner: Record<string, string> = {
  middag: '🍝',
  lunsj: '🥪',
  frokost: '🥞',
  suppe: '🥣',
  vegetar: '🥗',
  dessert: '🍰',
  annet: '🍕'
}

export default async function KategorierPage() {
  const kategorier = await getKategorier()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📂 Alle kategorier</h1>
      {kategorier.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">Ingen kategorier funnet</p>
          <p className="text-gray-500 text-sm mt-2">Har du lagt til oppskrifter?</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {kategorier.map((kategori) => (
            <Link
              key={kategori}
              href={`/kategorier/${kategori}`}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-red-500 hover:shadow-lg transition-all active:scale-95"
            >
              <div className="text-5xl mb-3">
                {kategoriIkoner[kategori] || '🍽️'}
              </div>
              <div className="font-semibold text-gray-700 capitalize text-lg">
                {kategori}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
