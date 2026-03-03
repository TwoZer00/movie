const URL = 'https://api.themoviedb.org/3';
//get client lang format en-US
const LANG = 'en-US';



const getMovies = async () => {
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/trending/movie/day?language=en-US`, options);
  const data = await response.json();
  return data;
};

const getCastFromMovie = async (movieId) => {
  const optionsURL = new URLSearchParams();
  optionsURL.append("language", LANG);
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/movie/${movieId}/credits?${optionsURL.toString()}`, options);
  const data = await response.json();
  return data;
};

const getMovie = async (movieId) => {
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/movie/${movieId}?language=en-US`, options);
  const data = await response.json();
  return data;
};

const getMoviesByName = async (movieName) => {
  const optionsURL = new URLSearchParams();
  optionsURL.append("language", LANG);
  optionsURL.append("query", movieName);
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/search/movie?${optionsURL.toString()}`, options);
  const data = await response.json();
  return data;
};

const getRandomMovie = async () => {
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/trending/movie/day?language=en-US`, options);
  const data = await response.json();
  return data.results[Math.floor(Math.random() * data.results.length)];
};
const getGenres = async () => {
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  if (sessionStorage.getItem("genres")) {
    return JSON.parse(sessionStorage.getItem("genres"));
  }
  const response = await fetch(`${URL}/genre/movie/list?language=en`, options);
  const data = await response.json();
  sessionStorage.setItem("genres", JSON.stringify(data.genres));
  return data.genres;
};
const getCustomSearchMovie = async (options) => {
  const optionsURL = new URLSearchParams(options);
  optionsURL.append("language", LANG);
  
  // Easy mode: if no filters, use recent popular movies
  if (!options || Object.keys(options).length === 0) {
    optionsURL.append("primary_release_date.gte", "2015-01-01");
    optionsURL.append("vote_count.gte", "1000");
  }
  
  // Random page between 1-50 for variety (safer range)
  const randomPage = Math.floor(Math.random() * 50) + 1;
  optionsURL.append("page", randomPage);
  
  let endpoint = `${!window.location.search.includes("movie") ? "discover" : "trending"}/movie`
  endpoint = `${endpoint}${window.location.search.includes("movie") ? "/day" : ""}`
  const response = await fetch(`${URL}/${endpoint}?${optionsURL.toString()}`, {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  });
  const data = await response.json();
  const movies = data.results;
  
  if (!movies || movies.length === 0) {
    // Retry with page 1 if no results
    optionsURL.set("page", "1");
    const retryResponse = await fetch(`${URL}/${endpoint}?${optionsURL.toString()}`, {
      method: "GET",
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
      }
    });
    const retryData = await retryResponse.json();
    return retryData.results[Math.floor(Math.random() * retryData.results.length)];
  }
  
  const movie = movies[Math.floor(Math.random() * movies.length)];
  return movie;
};
const getValidMovie = async (options) => {
  console.log("getting movies");
  const movie = await getCustomSearchMovie(options);
  const credits = await getCastFromMovie(movie.id)
  if (credits.cast.length < 10) {
    return getValidMovie(options);
  }
  if (!credits.cast.find(item => item.order === 0)?.profile_path) {
    return getValidMovie(options);
  }

  const cast = credits.cast.filter((item) => item?.profile_path !== null && item?.cast_id !== null && item?.id !== null);
  if (cast.length < 10) {
    return getValidMovie(options);
  }
  
  return [movie, cast];
};
// const getLinkedMovie = async (peopleId) => {
//   const options = {
//     method: "GET",
//     headers: {
//       accept: 'application/json',
//       Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
//     }
//   }
//   const response = await fetch(`${URL}/discover/movie/recommendations?language=en-US`, options);
//   const data = await response.json();
//   const movies = data.results;
//   const movie = movies[Math.floor(Math.random() * movies.length)];
//   return movie;
// };

// const getLinkedPeopleFromMovie



const getDailyMovie = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Simple hash function for better distribution
  const hash = today.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  let pageNumber = (Math.abs(hash) % 500) + 1;
  let movieIndex = Math.abs(hash >> 8) % 20;
  let attempts = 0;
  
  while (attempts < 10) {
    const optionsURL = new URLSearchParams();
    optionsURL.append("language", LANG);
    optionsURL.append("primary_release_date.gte", "2015-01-01");
    optionsURL.append("vote_count.gte", "1000");
    optionsURL.append("page", pageNumber);
    
    const response = await fetch(`${URL}/discover/movie?${optionsURL.toString()}`, {
      method: "GET",
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
      }
    });
    const data = await response.json();
    const movies = data.results;
    const movie = movies[movieIndex] || movies[0];
    
    // Validate movie has enough cast with photos
    const credits = await getCastFromMovie(movie.id);
    const validCast = credits.cast.filter((item) => item?.profile_path !== null && item?.cast_id !== null && item?.id !== null);
    
    if (validCast.length >= 10 && credits.cast.find(item => item.order === 0)?.profile_path) {
      return movie;
    }
    
    // Try next movie
    attempts++;
    movieIndex = (movieIndex + 1) % 20;
  }
  
  // Fallback to regular getValidMovie if no valid daily movie found
  const [movie] = await getValidMovie();
  return movie;
};

export { getMovies, getCastFromMovie, getMovie, getMoviesByName, getRandomMovie, getValidMovie, getGenres, getDailyMovie };