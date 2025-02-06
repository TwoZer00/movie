const getCountries = async ()=>{
  const apiURL = 'https://restcountries.com/v3.1'
  let data = sessionStorage.getItem('countries')
    if (data) {
        data = filterRealCountries(JSON.parse(data))
        return data
    }
    data = await (await fetch(`${apiURL}/all`)
        .catch(error => {
            throw `${error.message}`
        }
        )).json()
    data = filterRealCountries(data)
    sessionStorage.setItem('countries', JSON.stringify(data))
    return data
}
function filterRealCountries(countries) {
  return countries.filter(country => country.unMember)
}

export {getCountries}