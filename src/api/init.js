const URL = 'https://api.themoviedb.org/3';

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
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/movie/${movieId}/credits?language=en-US`, options);
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
  const options = {
    method: "GET",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN}`
    }
  }
  const response = await fetch(`${URL}/search/movie?query=${movieName}&language=en-US`, options);
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

const getValidMovie = async () => {
  const movie = await getRandomMovie();
  // const movie = await getMovie(550);
  const credits = await getCastFromMovie(movie.id)
  if (credits.cast.length < 10) {
    getValidMovie()
  }
  if (!credits.cast.find(item => item.order === 0)?.profile_path) {
    getValidMovie()
  }

  const cast = credits.cast.filter((item) => item?.profile_path !== null && item?.cast_id !== null && item?.id !== null);
  // console.log(movie,cast);

  return [movie, cast];
};

export { getMovies, getCastFromMovie, getMovie, getMoviesByName, getRandomMovie, getValidMovie };