import { useEffect, useState } from 'react';

export default function Confetti({ duration = 3000 }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 5,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (pieces.length === 0) return null;

  return (
    <div className='fixed inset-0 pointer-events-none z-50 overflow-hidden'>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className='absolute animate-confetti'
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDuration: `${piece.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
}
