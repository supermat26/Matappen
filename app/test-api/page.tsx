import { supabase } from '@/lib/supabaseClient'

export default async function TestApiPage() {
  // Test 1: Sjekk miljøvariabler
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Test 2: Prøv å hente oppskrifter
  const { data: oppskrifter, error: oppskrifterError } = await supabase
    .from('oppskrifter')
    .select('*')
    .limit(5)

  // Test 3: Prøv å hente kategorier
  const { data: kategorierData, error: kategorierError } = await supabase
    .from('oppskrifter')
    .select('kategori')

  // Test 4: Sjekk om tabellen finnes
  const { data: tabellSjekk, error: tabellError } = await supabase
    .from('oppskrifter')
    .select('count')
    .limit(1)

  // Fjern duplikater for kategorier
  const kategorier: string[] = []
  kategorierData?.forEach((item) => {
    if (!kategorier.includes(item.kategori)) {
      kategorier.push(item.kategori)
    }
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 API Test - Matappen</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          Denne siden tester tilkoblingen til Supabase og viser all data.
        </p>
      </div>

      {/* Miljøvariabler */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold text-lg mb-2">📌 Miljøvariabler:</h2>
        <div className="space-y-1">
          <p className={url ? 'text-green-600' : 'text-red-600'}>
            NEXT_PUBLIC_SUPABASE_URL: {url ? '✅ Satt' : '❌ Mangler'}
          </p>
          <p className={key ? 'text-green-600' : 'text-red-600'}>
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {key ? '✅ Satt' : '❌ Mangler'}
          </p>
        </div>
        {url && (
          <div className="mt-2 text-sm">
            <p className="text-gray-600">URL: <span className="font-mono">{url}</span></p>
            <p className="text-gray-600">Key: <span className="font-mono">{key?.substring(0, 30)}...</span></p>
          </div>
        )}
      </div>

      {/* Tabell-sjekk */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">🗄️ Tabell-sjekk:</h2>
        {tabellError ? (
          <p className="text-red-600">❌ Feil: {tabellError.message}</p>
        ) : (
          <p className="text-green-600">✅ Tabellen 'oppskrifter' finnes</p>
        )}
      </div>

      {/* Oppskrifter */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">📊 Oppskrifter:</h2>
        {oppskrifterError ? (
          <div>
            <p className="text-red-600 font-bold">❌ Feil ved henting:</p>
            <pre className="bg-red-50 p-2 rounded mt-1 text-sm overflow-auto">
              {JSON.stringify(oppskrifterError, null, 2)}
            </pre>
          </div>
        ) : oppskrifter && oppskrifter.length > 0 ? (
          <div>
            <p className="text-green-600 font-bold">✅ Fant {oppskrifter.length} oppskrifter</p>
            <ul className="mt-2 space-y-2">
              {oppskrifter.map((opp) => (
                <li key={opp.id} className="border-b pb-2">
                  <span className="font-semibold">{opp.tittel}</span>
                  <span className="text-gray-500 text-sm ml-2">({opp.kategori})</span>
                  {opp.bilde_url && (
                    <div className="mt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={opp.bilde_url} 
                        alt={opp.tittel} 
                        className="w-32 h-24 object-cover rounded"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <p className="text-yellow-600 font-bold">⚠️ Ingen oppskrifter funnet</p>
            <p className="text-gray-500 text-sm mt-1">
              Sjekk at du har lagt til oppskrifter i databasen.
            </p>
          </div>
        )}
      </div>

      {/* Kategorier */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h2 className="font-bold text-lg mb-2">📂 Kategorier:</h2>
        {kategorierError ? (
          <p className="text-red-600">❌ Feil: {kategorierError.message}</p>
        ) : kategorier.length > 0 ? (
          <div>
            <p className="text-green-600">✅ Fant {kategorier.length} kategorier</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {kategorier.map((kat) => (
                <span key={kat} className="bg-gray-200 px-3 py-1 rounded-full capitalize text-sm">
                  {kat}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-yellow-600">⚠️ Ingen kategorier funnet</p>
        )}
      </div>

      {/* Rådata (for debugging) */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="font-bold text-lg mb-2">🔍 Rådata (debug):</h2>
        <details>
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            Klikk for å se rådata
          </summary>
          <pre className="bg-gray-900 text-green-400 p-4 rounded mt-2 text-xs overflow-auto max-h-96">
            {JSON.stringify({
              oppskrifter: oppskrifter,
              kategorier: kategorier,
              url: url,
              keyPrefix: key?.substring(0, 20)
            }, null, 2)}
          </pre>
        </details>
      </div>

      {/* Hjelp */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="font-bold text-red-800">🆘 Hjelp - vanlige problemer:</h2>
        <ul className="text-sm text-red-700 space-y-1 mt-2">
          <li>• <strong>Ingen oppskrifter:</strong> Kjør INSERT SQL i Supabase SQL Editor</li>
          <li>• <strong>Feil med RLS:</strong> Kjør "ALTER TABLE oppskrifter DISABLE ROW LEVEL SECURITY;"</li>
          <li>• <strong>Feil API-nøkler:</strong> Kopier på nytt fra Supabase → Settings → API</li>
          <li>• <strong>CORS-feil:</strong> Legg til "*" i Supabase → Settings → API → CORS</li>
        </ul>
      </div>
    </div>
  )
}
