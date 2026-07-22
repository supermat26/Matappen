// Legg til import
import LesStegKnapp from '@/components/oppskrift/LesStegKnapp'

// Og i steg-loop-en, legg til knappen:
<div className="flex items-start gap-4">
  <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
    {index + 1}
  </div>
  <div className="flex-1">
    <div className="flex items-start justify-between gap-4">
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
