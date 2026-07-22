// Legg til i bunnen av filen, men innenfor component-funksjonen

// Favoritt-knapp (midlertidig løsning uten database)
const [isFavorite, setIsFavorite] = useState(false)

useEffect(() => {
  const favoritter = JSON.parse(localStorage.getItem('favoritter') || '[]')
  setIsFavorite(favoritter.includes(params.id))
}, [params.id])

const toggleFavorite = () => {
  const favoritter = JSON.parse(localStorage.getItem('favoritter') || '[]')
  if (isFavorite) {
    const nye = favoritter.filter((id: string) => id !== params.id)
    localStorage.setItem('favoritter', JSON.stringify(nye))
    setIsFavorite(false)
  } else {
    favoritter.push(params.id)
    localStorage.setItem('favoritter', JSON.stringify(favoritter))
    setIsFavorite(true)
  }
}
