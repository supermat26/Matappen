import { getOppskrift } from '@/lib/oppskrifter'
import type { Ingrediens, Steg } from '@/lib/oppskrifter'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LeggTilHandleliste from '@/components/oppskrift/LeggTilHandleliste'
import Opplesningsknapp from '@/components/oppskrift/Opplesningsknapp'
import LesStegKnapp from '@/components/oppskrift/LesStegKnapp'

interface Props {
  params: {
    id: string
  }
}

export default async function OppskriftPage({ params }: Props) {
  const oppskrift = await getOppskrift(params.id)

  if (!oppskrift) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Tilbake-knapp */}
      <Link
        href="/"
        className="inline-block mb-6 text-red-600 hover:text-red-700"
      >
        ← Tilbake til forsiden
      </Link>

      {/* Bilde */}
      {oppskrift.bilde_url && (
        <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={oppskrift.bilde_url}
            alt={oppskrift.tittel}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tittel og info */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        {oppskrift.tittel}
      </h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
        <span>⏱ {oppskrift.prep_time || 30} min</span>
        <span>👥 {oppskrift.porsjoner || 4} porsjoner</span>
        <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
          {oppskrift.kategori}
        </span>
      </div>

      {/* Beskrivelse */}
      {oppskrift.beskrivelse && (
        <p className="text-gray-700 text-lg mb-8">
          {oppskrift.beskrivelse}
        </p>
      )}

      {/* Ingredienser */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">🛒 Ingredienser</h2>
        <ul className="space-y-2">
          {oppskrift.ingredienser.map((ingrediens: Ingrediens) => (
            <li
              key={ingrediens.id}
              className="flex justify-between items-center border-b border-gray-200 pb-2"
            >
              <span className="text-gray-800">{ingrediens.navn}</span>
              <span className="text-gray-600">{ingrediens.mengde}</span>
            </li>
          ))}
        </ul>
        <LeggTilHandleliste ingredienser={oppskrift.ingredienser} />
      </div>

      {/* Steg med opplesning */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold">📝 Fremgangsmåte</h2>
          <Opplesningsknapp steg={oppskrift.steg} />
        </div>
        <div className="space-y-6">
          {oppskrift.steg.map((steg: Steg, index: number) => (
            <div
              key={steg.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-gray-800 text-lg">{steg.beskrivelse}</p>
                    <LesStegKnapp tekst={steg.beskrivelse} stegNummer={index + 1} />
                  </div>
                  {steg.bilde_url && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={steg.bilde_url}
                        alt={`Steg ${index + 1}`}
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}