// ====== SETTINGS ======
const API_KEY = "de10b736";
const BASE_URL = "https://www.omdbapi.com/";
const DEFAULT_SEARCH = "batman";

const NO_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750">
       <rect width="100%" height="100%" fill="#333"/>
       <text x="50%" y="50%" fill="#aaa" font-size="32" font-family="Arial"
             text-anchor="middle">No Poster</text>
     </svg>`
  );

// ====== PAGE ELEMENTS ======
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

// ====== 1. SEARCH THE API ======
async function searchMovies(term) {
  message.textContent = "Loading movies...";
  movieGrid.innerHTML = "";

  try {
    const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(term)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const data = await response.json();

    // OMDb replies with status 200 even for problems, so check this field
    if (data.Response === "False") {
      message.textContent = data.Error;
      return;
    }

    message.textContent = "";
    displayMovies(data.Search);
  } catch (error) {
    message.textContent = "Oops! Could not load movies. Check your internet or API key.";
    console.error(error);
  }
}

// ====== 2. SHOW MOVIES AS CARDS ======
function displayMovies(movies) {
  movieGrid.innerHTML = "";

  movies.forEach((movie) => {
    const poster = movie.Poster !== "N/A" ? movie.Poster : NO_POSTER;

    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${poster}" alt="${movie.Title}" />
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>📅 ${movie.Year} &nbsp; 🎞 ${movie.Type}</p>
      </div>
    `;

    card.addEventListener("click", () => showDetails(movie.imdbID));

    movieGrid.appendChild(card);
  });
}

// ====== 3. GET FULL DETAILS FOR ONE MOVIE ======
async function showDetails(imdbID) {
  modal.classList.remove("hidden");
  modalBody.innerHTML = "<p>Loading details...</p>";

  try {
    const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const movie = await response.json();

    if (movie.Response === "False") {
      modalBody.innerHTML = `<p>${movie.Error}</p>`;
      return;
    }

    const poster = movie.Poster !== "N/A" ? movie.Poster : NO_POSTER;

    modalBody.innerHTML = `
      <div class="modal-layout">
        <img src="${poster}" alt="${movie.Title}" />
        <div class="modal-text">
          <h2>${movie.Title} (${movie.Year})</h2>
          <p class="rating">⭐ ${movie.imdbRating} / 10</p>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Runtime:</strong> ${movie.Runtime}</p>
          <p><strong>Director:</strong> ${movie.Director}</p>
          <p><strong>Actors:</strong> ${movie.Actors}</p>
          <p>${movie.Plot}</p>
        </div>
      </div>
    `;
  } catch (error) {
    modalBody.innerHTML = "<p>Could not load details.</p>";
    console.error(error);
  }
}

// ====== 4. CLOSE THE POPUP ======
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.classList.add("hidden");
  }
});

// ====== 5. SEARCH BOX (with debounce) ======
let timer;

searchInput.addEventListener("input", () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    const term = searchInput.value.trim();

    if (term === "") {
      searchMovies(DEFAULT_SEARCH);
    } else if (term.length < 3) {
      message.textContent = "Type at least 3 letters...";
    } else {
      searchMovies(term);
    }
  }, 500);
});

// ====== 6. START THE APP ======
searchMovies(DEFAULT_SEARCH);