import { getOppskrift } from '@/lib/oppskrifter'
import type { Ingrediens, Steg } from '@/lib/oppskrifter'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LeggTilHandleliste from '@/components/oppskrift/LeggTilHandleliste'
import Opplesningsknapp from '@/components/oppskrift/Opplesningsknapp'
import LesStegKnapp from '@/components/oppskrift/LesStegKnapp'

// ... resten av koden ...

// I steg-loopen:
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