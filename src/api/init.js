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
  const movie = movies[Math.floor(Math.random() * movies.length)];
  return movie;
};
const getValidMovie = async (options) => {
  // console.log(options,new URLSearchParams(options).toString());
  console.log("getting movies");
  const movie = await getCustomSearchMovie(options);
  // const movie = await getRandomMovie();
  // const movie = await getMovie(550);
  const credits = await getCastFromMovie(movie.id)
  if (credits.cast.length < 10) {
    getValidMovie()
    console.log("error a");
  }
  if (!credits.cast.find(item => item.order === 0)?.profile_path) {
    getValidMovie()
    console.log("error b");
  }

  const cast = credits.cast.filter((item) => item?.profile_path !== null && item?.cast_id !== null && item?.id !== null);
  if (cast.length < 10) {
    getValidMovie()
    console.log("error c");
  }
  
  // console.log("movie returned:", movie.id);
  
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



export { getMovies, getCastFromMovie, getMovie, getMoviesByName, getRandomMovie, getValidMovie, getGenres };