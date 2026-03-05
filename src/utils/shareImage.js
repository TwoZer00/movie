export const generateShareImage = async (data) => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Movie theater gradient (dark red to gold)
  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, '#991b1b');
  gradient.addColorStop(1, '#d97706');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, 800, 600);

  // Title with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎬 Filmdle', 400, 80);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Game mode
  ctx.font = '24px Arial';
  ctx.fillText(data.mode, 400, 120);

  // Stats container with rounded corners
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(60, 160, 680, 320, 20);
  ctx.fill();

  if (data.type === 'guess') {
    // Result emoji
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.isWin ? '✅' : '❌', 400, 260);

    // Stats grid
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    
    ctx.fillText(data.tries + '/5', 200, 350);
    ctx.fillText(data.difficulty, 400, 350);
    ctx.fillText(data.streak, 600, 350);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Tries', 200, 380);
    ctx.fillText('Difficulty', 400, 380);
    ctx.fillText('Streak', 600, 380);
    
    // Result text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = data.isWin ? '#10b981' : '#ef4444';
    ctx.fillText(data.isWin ? 'Victory!' : 'Better luck next time', 400, 440);
  } else {
    // Chain emoji
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔗', 400, 260);

    // Stats grid
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    
    ctx.fillText(data.chainLength, 200, 350);
    ctx.fillText(data.time, 400, 350);
    ctx.fillText(data.hintsUsed + '/3', 600, 350);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Chain', 200, 380);
    ctx.fillText('Time', 400, 380);
    ctx.fillText('Hints', 600, 380);
    
    // Best chain
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#d97706';
    ctx.fillText('🏆 Best: ' + data.bestChain, 400, 440);
  }

  // Footer
  ctx.font = '18px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('Play at ' + window.location.hostname, 400, 550);

  return canvas.toDataURL('image/png');
};

export const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const shareImageNative = async (dataUrl, title, text) => {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], 'filmdle-result.png', { type: 'image/png' });
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title,
      text,
      files: [file]
    });
    return true;
  }
  return false;
};
