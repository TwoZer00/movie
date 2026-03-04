# Filmdle 🎬

Movie puzzle game using TheMovieDB API services.
Guess movies by cast or build actor-movie chains!
## Technologies stack

- [React - Javascript](https://react.dev/)
- [TailwindCss 3.4.17 ](https://mui.com/material-ui/)
- [React router dom](https://reactrouter.com/en/main) *not implemented yet*
- [Google AdSense](https://www.google.com/adsense/)

## Features

### Guess by Cast Mode
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
  - [x] Themed collections (create custom movie sets)
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

### Link Chain Mode
- [x] Alternating actor-movie guessing
  - [x] Search/type actor names from shown movies
  - [x] Search/type movie titles from shown actors
  - [x] No reuse of actors/movies in chain
- [x] Progressive hints system
  - [x] Actor hints: Character name, birth year, first letter
  - [x] Movie hints: Year/genres, cast members, director
  - [x] Max 3 hints per game, resets when switching modes
  - [x] Search filtering after all hints used
- [x] Movie logos instead of posters (avoid spoilers)
- [x] Visual chain display
  - [x] Horizontal scrollable chain
  - [x] Numbered actor badges
  - [x] Hover animations
  - [x] Arrow transitions
- [x] Game controls
  - [x] Give Up button (non-daily mode only)
  - [x] Real-time timer
  - [x] Best chain tracker
- [x] Statistics tracking
  - [x] Total games played
  - [x] Best chain length
  - [x] Average chain length
  - [x] Stats displayed in Settings
- [x] Share functionality
  - [x] Copy results with chain length, time, hints used
- [x] Daily Link Challenge
  - [x] Same starting movie for everyone
  - [x] Progress saving in localStorage
  - [x] One attempt per day
  - [x] Countdown timer for next challenge
- [x] Performance optimizations
  - [x] Debounced search (300ms)
  - [x] Parallel API requests with Promise.all

### Settings & Preferences
- [x] Adult content filter (toggleable with confirmation)
- [x] Sound effects toggle
- [x] Statistics reset
- [x] TMDB attribution

### Monetization
- [x] Google AdSense integration
  - [x] Desktop vertical sidebar ads (160x600)
  - [x] Mobile bottom banner ads
  - [x] Responsive ad placement

### UI/UX
- [x] Responsive design (mobile & desktop optimized)
- [x] Loading states
- [x] Keyboard navigation for search
- [x] Skip button (disabled for daily challenges)
- [x] Organized menu with mode separation

## TODO (Firebase Integration)
- [ ] Multiplayer mode
  - [ ] Real-time racing against friends
  - [ ] Private/public rooms
- [ ] Advanced player stats
  - [ ] Global leaderboards
  - [ ] Personal insights & analytics
  - [ ] Achievement badges
  - [ ] Profile system