import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDailyStreak, getWeekDays } from '../utils/dailyStreak'
import PWAInstallBanner from '../components/PWAInstallBanner'
import PWAFeatures from '../components/PWAFeatures'
import { trackModeSelect } from '../utils/analytics'

const MODES = [
  {
    key: 'guess',
    title: 'Guess by Cast',
    subtitle: 'Identify the movie from its cast',
    icon: '🎬',
    accent: 'from-red-600 to-rose-500',
    accentBg: 'bg-red-500/10 dark:bg-red-500/15',
    accentText: 'text-red-600 dark:text-red-400',
    steps: [
      '🎯 5 attempts to guess the movie',
      '👤 Cast members revealed progressively',
      '💡 Keywords, genres & director as hints',
      '📅 Year arrows guide you closer',
    ],
  },
  {
    key: 'link',
    title: 'Link Chain',
    subtitle: 'Build actor-movie chains',
    icon: '🔗',
    accent: 'from-amber-500 to-orange-500',
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    accentText: 'text-amber-600 dark:text-amber-400',
    steps: [
      '🎬 Movie shown → type an actor from it',
      '👤 Actor shown → type a movie they\'re in',
      '🔄 Alternate back and forth, no repeats',
      '🏆 How long can you go?',
    ],
  },
  {
    key: 'odd',
    title: 'Odd One Out',
    subtitle: 'Find the movie that doesn\'t belong',
    icon: '🎯',
    accent: 'from-violet-600 to-purple-500',
    accentBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    accentText: 'text-violet-600 dark:text-violet-400',
    steps: [
      '🎬 4 movies shown — 3 share a connection',
      '🔍 Same actor, director, genre, decade…',
      '❓ Hint reveals the connection (-1 point)',
      '❤️ 3 lives — wrong answers cost one',
    ],
  },
]

export default function Menu() {
  const [dailyCompleted, setDailyCompleted] = useState(false)
  const [stats, setStats] = useState({ wins: 0, currentStreak: 0, bestChain: 0, dailyStreak: 0 })
  const [weekDays, setWeekDays] = useState([])
  const [openMode, setOpenMode] = useState(null)
  const navigate = useNavigate()

  const checkDailyStatus = () => {
    const today = new Date().toISOString().split('T')[0]
    const completed = localStorage.getItem(`daily_${today}`)
    setDailyCompleted(!!completed)
    const gameStats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"currentStreak":0}')
    const linkStats = JSON.parse(localStorage.getItem('linkChainStats') || '{"bestChain":0}')
    const dailyStreak = getDailyStreak()
    setStats({ ...gameStats, bestChain: linkStats.bestChain || 0, dailyStreak })
    setWeekDays(getWeekDays())
  }

  useEffect(() => {
    checkDailyStatus()
    const onVisible = () => { if (!document.hidden) checkDailyStatus() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const streakMsg = dailyCompleted
    ? '✓ Done for today! Come back tomorrow.'
    : stats.dailyStreak >= 7 ? `🔥 ${stats.dailyStreak} days! Don't break it now!`
    : stats.dailyStreak >= 3 ? `${stats.dailyStreak} days strong — keep going!`
    : stats.dailyStreak > 0 ? `${stats.dailyStreak} day streak — play now to keep it!`
    : 'Start your streak today!'

  const handlePlay = (key) => {
    trackModeSelect(key);
    if (key === 'guess') navigate('/play')
    else if (key === 'link') navigate('/link')
    else if (key === 'odd') navigate('/odd')
  }

  return (
    <div className='flex flex-col flex-1 items-center p-3 sm:p-4 pb-2 sm:pb-6'>
      <PWAInstallBanner streak={stats.dailyStreak} />
      <div className='w-full max-w-lg flex flex-col gap-3 sm:gap-4'>
        <PWAFeatures />

        {/* Stats bar */}
        <div className='flex justify-around card rounded-2xl py-3 px-4'>
          <Stat value={stats.wins} label='Wins' />
          <div className='w-px bg-black/8 dark:bg-white/8' />
          <Stat value={stats.currentStreak} label='Streak' highlight />
          <div className='w-px bg-black/8 dark:bg-white/8' />
          <Stat value={stats.bestChain} label='Best Chain' />
        </div>

        {/* Daily Challenge hero */}
        <div className='rounded-2xl overflow-hidden shadow-lg'>
          <div className='relative bg-gradient-to-br from-red-700 via-red-600 to-amber-600 p-5 text-white'>
            {/* Decorative film holes */}
            <div className='absolute top-0 left-0 right-0 flex justify-between px-2 pointer-events-none'>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className='w-3 h-3 rounded-full bg-black/20 -mt-1.5' />
              ))}
            </div>

            <div className='flex justify-between items-start mb-4 mt-1'>
              <div>
                <p className='text-[10px] uppercase tracking-widest opacity-60 mb-1'>Today's Challenge</p>
                <h2 className='font-display text-4xl tracking-wide leading-none'>DAILY FILM</h2>
              </div>
              {stats.dailyStreak > 0 && (
                <div className='bg-white/15 border border-white/25 px-3 py-1.5 rounded-xl text-sm font-bold backdrop-blur-sm'>
                  🔥 {stats.dailyStreak}
                </div>
              )}
            </div>

            {/* Week tracker */}
            <div className='flex justify-between bg-black/20 rounded-xl p-3 mb-4'>
              {weekDays.map((day, i) => (
                <div key={i} className='flex flex-col items-center gap-1.5'>
                  <span className='text-[9px] uppercase tracking-wider opacity-50'>{day.label}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    day.completed  ? 'bg-white text-red-600 shadow-sm'
                    : day.isToday  ? 'bg-white/25 border-2 border-white'
                    : day.isFuture ? 'bg-white/8 text-white/25'
                    : day.missed   ? 'bg-black/30 text-white/40'
                    :                'bg-white/8 text-white/25'
                  }`}>
                    {day.completed ? '✓' : day.isToday ? '?' : day.missed ? '✗' : '·'}
                  </div>
                </div>
              ))}
            </div>

            <p className='text-xs text-center opacity-80 mb-4'>{streakMsg}</p>

            <div className='flex gap-2'>
              <button
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                  dailyCompleted
                    ? 'bg-white/15 opacity-50 cursor-not-allowed text-white/70'
                    : 'bg-white text-red-700 hover:bg-white/90 active:scale-[0.98] shadow-md font-bold'
                }`}
                onClick={() => { trackModeSelect('guess_daily'); navigate('/play?daily=true'); }}
                disabled={dailyCompleted}
              >
                {dailyCompleted ? '🎬 Completed ✓' : '🎬 Play Today\'s Challenge'}
              </button>
              <button
                className='py-3 px-4 rounded-xl font-semibold text-sm bg-white/15 hover:bg-white/25 transition-all border border-white/20'
                onClick={() => { trackModeSelect('link_daily'); navigate('/link?daily=true'); }}
                title='Daily Link Chain'
              >
                🔗
              </button>
            </div>
          </div>
        </div>

        {/* Game modes */}
        <div className='flex flex-col gap-3'>
          <p className='text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1'>Game Modes</p>
          {MODES.map((mode) => (
            <div key={mode.key} className='card rounded-2xl overflow-hidden'>
              <div className='flex items-center gap-4 p-4'>
                <div className={`w-12 h-12 rounded-xl ${mode.accentBg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {mode.icon}
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-bold text-gray-900 dark:text-white text-sm leading-tight'>{mode.title}</h3>
                  <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate'>{mode.subtitle}</p>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <button
                    onClick={() => setOpenMode(openMode === mode.key ? null : mode.key)}
                    className='w-9 h-9 rounded-lg bg-black/5 dark:bg-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs flex items-center justify-center transition-colors active:scale-95'
                  >
                    {openMode === mode.key ? '▲' : '?'}
                  </button>
                  {mode.key === 'guess' ? (
                    <>
                      <button
                        onClick={() => navigate('/guess-setup')}
                        className='w-9 h-9 rounded-lg bg-black/5 dark:bg-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs flex items-center justify-center transition-colors active:scale-95'
                      >
                        ⚙
                      </button>
                      <button
                        onClick={() => handlePlay(mode.key)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${mode.accent} hover:opacity-90 active:scale-[0.97] transition-all shadow-sm`}
                      >
                        Play
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handlePlay(mode.key)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${mode.accent} hover:opacity-90 active:scale-[0.97] transition-all shadow-sm`}
                    >
                      Play
                    </button>
                  )}
                </div>
              </div>

              {openMode === mode.key && (
                <div className='px-4 pb-4 animate-fadeIn'>
                  <ul className={`rounded-xl p-3 space-y-1.5 border ${mode.accentBg} border-black/5 dark:border-white/5`}>
                    {mode.steps.map((step, i) => (
                      <li key={i} className='text-xs text-gray-600 dark:text-gray-300'>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/settings')}
          className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs flex items-center gap-1.5 mx-auto transition-colors px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5'
        >
          ⚙️ Settings & Stats
        </button>
      </div>
    </div>
  )
}

function Stat({ value, label, highlight }) {
  return (
    <div className='flex flex-col items-center gap-0.5'>
      <span className={`text-2xl font-bold leading-none ${highlight ? 'text-red-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </span>
      <span className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>{label}</span>
    </div>
  )
}
