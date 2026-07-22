import { createClient } from '@supabase/supabase-js'

export default async function TestApiPage() {
  // Opprett klient direkte med hardkodede verdier (KUN FOR TESTING!)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Prøv en enkel spørring
  const { data: oppskrifter, error, count } = await supabase
    .from('oppskrifter')
    .select('*', { count: 'exact' })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 API Test - Forenklet</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold">Debug info:</h2>
        <p>URL: {supabaseUrl}</p>
        <p>Key: {supabaseKey.substring(0, 20)}...</p>
        <p>Antall oppskrifter: {count ?? 'Ukjent'}</p>
        {error && (
          <div className="bg-red-100 p-2 rounded mt-2">
            <p className="text-red-600 font-bold">Feil:</p>
            <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-bold text-lg mb-2">📊 Oppskrifter:</h2>
        {oppskrifter && oppskrifter.length > 0 ? (
          <ul className="space-y-2">
            {oppskrifter.map((opp) => (
              <li key={opp.id} className="border-b pb-2">
                <span className="font-semibold">{opp.tittel}</span>
                <span className="text-gray-500 text-sm ml-2">({opp.kategori})</span>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p className="text-yellow-600">⚠️ Ingen oppskrifter funnet</p>
            {error && <p className="text-red-600 text-sm mt-2">Feil: {error.message}</p>}
          </div>
        )}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800">💡 Tips:</h3>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• Sjekk at RLS er av: <code className="bg-blue-100 px-2 py-0.5 rounded">ALTER TABLE oppskrifter DISABLE ROW LEVEL SECURITY;</code></li>
          <li>• Sjekk at du har data: <code className="bg-blue-100 px-2 py-0.5 rounded">SELECT COUNT(*) FROM oppskrifter;</code></li>
          <li>• Prøv å oppdatere siden etter å ha kjørt SQL</li>
        </ul>
      </div>
    </div>
  )
}
