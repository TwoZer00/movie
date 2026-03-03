# Movie

Puzzle using TheMovieDB API services.
Guess the movie just with the cast, every try you reveal a new cast member.
## Technologies stack

- [React - Javascript](https://react.dev/)
- [TailwindCss 3.4.17 ](https://mui.com/material-ui/)
- [React router dom](https://reactrouter.com/en/main) *not implemented yet*

## Features

- [x] Base game
  - [x] Show movie poster (revealed on game end)
  - [x] Show movie title (revealed on game end)
  - [x] Show cast members (up to 5, ordered by popularity)
  - [x] Progressive hints with each try
  - [x] Genre hints after 2nd and 3rd tries
  - [x] Year hints with directional arrows
  - [x] Genre matching indicators
  - [x] Expandable try history
  - [x] Animations (fadeIn, slideIn, scaleIn)
- [x] Game modes
  - [x] Random play with custom filters (genre, decade, region)
  - [x] Daily challenge (one per day)
- [x] Results
  - [x] Win/loss detection
  - [x] Sound effects (toggleable)
  - [x] Modal with results
  - [x] Confetti animation on win
- [x] Statistics tracking
  - [x] Total games played
  - [x] Win rate percentage
  - [x] Current streak
  - [x] Max streak
  - [x] Reset stats option
- [x] Share functionality
  - [x] Copy results to clipboard
- [x] UI/UX
  - [x] Responsive design
  - [x] Loading states
  - [x] Keyboard navigation for search
  - [x] Skip button (disabled for daily challenge)
  - [x] Countdown timer for next daily challenge