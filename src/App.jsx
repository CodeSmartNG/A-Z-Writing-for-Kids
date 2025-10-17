import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Sound hook that always works
const useSimpleSound = () => {
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const tones = {
        click: { freq: 523.25, duration: 0.1 },
        success: { freq: 784.00, duration: 0.8 },
        magic: { freq: 659.25, duration: 0.5 }
      };

      const tone = tones[type] || tones.click;
      
      oscillator.frequency.value = tone.freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + tone.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + tone.duration);
      
    } catch (error) {
      // App continues working without sounds
    }
  };

  return playSound;
};

const AlphabetWriter = () => {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [strokeCount, setStrokeCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [completedLetters, setCompletedLetters] = useState(new Set());
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  
  const playSound = useSimpleSound(); // Add this line

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Initialize canvas
  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      setCanvasSize({ width, height });
      
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      
      clearCanvas();
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);
    
    return () => {
      window.removeEventListener('resize', initCanvas);
    };
  }, [currentLetter]);

  const clearCanvas = () => {
    playSound('click'); // Add sound here
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);
    
    setStrokeCount(0);
    drawLetterGuide();
  };

  const drawLetterGuide = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.font = 'bold 180px Arial';
    ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentLetter, canvasSize.width / 2, canvasSize.height / 2);
  };

  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width / scale),
      y: (clientY - rect.top) * (canvas.height / rect.height / scale)
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;
    
    const { x, y } = getCanvasCoordinates(clientX, clientY);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;
    
    const { x, y } = getCanvasCoordinates(clientX, clientY);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStrokeCount(prev => {
        const newCount = prev + 1;
        
        if (newCount >= 2) {
          playSound('success'); // Success sound on completion
          setCompletedLetters(prev => new Set([...prev, currentLetter]));
        } else {
          playSound('click'); // Click sound for each stroke
        }
        
        return newCount;
      });
    }
  };

  const nextLetter = () => {
    playSound('click');
    const currentIndex = alphabet.indexOf(currentLetter);
    if (currentIndex < alphabet.length - 1) {
      setCurrentLetter(alphabet[currentIndex + 1]);
    }
  };

  const previousLetter = () => {
    playSound('click');
    const currentIndex = alphabet.indexOf(currentLetter);
    if (currentIndex > 0) {
      setCurrentLetter(alphabet[currentIndex - 1]);
    }
  };

  const showDemonstration = () => {
    playSound('magic'); // Magic sound for demo
    setShowDemo(true);
    clearCanvas();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    
    switch(currentLetter) {
      case 'A':
        ctx.moveTo(canvasSize.width * 0.5, canvasSize.height * 0.2);
        ctx.lineTo(canvasSize.width * 0.3, canvasSize.height * 0.8);
        ctx.moveTo(canvasSize.width * 0.5, canvasSize.height * 0.2);
        ctx.lineTo(canvasSize.width * 0.7, canvasSize.height * 0.8);
        ctx.moveTo(canvasSize.width * 0.35, canvasSize.height * 0.5);
        ctx.lineTo(canvasSize.width * 0.65, canvasSize.height * 0.5);
        break;
      case 'B':
        ctx.moveTo(canvasSize.width * 0.3, canvasSize.height * 0.2);
        ctx.lineTo(canvasSize.width * 0.3, canvasSize.height * 0.8);
        ctx.moveTo(canvasSize.width * 0.3, canvasSize.height * 0.2);
        ctx.quadraticCurveTo(canvasSize.width * 0.7, canvasSize.height * 0.3, canvasSize.width * 0.3, canvasSize.height * 0.5);
        ctx.moveTo(canvasSize.width * 0.3, canvasSize.height * 0.5);
        ctx.quadraticCurveTo(canvasSize.width * 0.7, canvasSize.height * 0.6, canvasSize.width * 0.3, canvasSize.height * 0.8);
        break;
      default:
        ctx.moveTo(canvasSize.width * 0.3, canvasSize.height * 0.5);
        ctx.lineTo(canvasSize.width * 0.7, canvasSize.height * 0.5);
    }
    
    ctx.stroke();
    
    setTimeout(() => {
      setShowDemo(false);
      clearCanvas();
    }, 3000);
  };

  const selectLetter = (letter) => {
    playSound('click');
    setCurrentLetter(letter);
  };

  

  // ... rest of your JSX remains the same
  return (
    <div className="app">
      {/* Your existing JSX here */}
      
      <header className="app-header">
        <h1>Learn to Write Alphabet</h1>
        <p>Trace the letters with your finger to learn how to write!</p>
      </header>

      <div className="letter-display">
        <div className="current-letter">{currentLetter}</div>
        <div className="letter-status">
          {completedLetters.has(currentLetter) && (
            <span className="completed-badge">✔ Completed!</span>
          )}
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          className="writing-canvas"
        />
        {showDemo && (
          <div className="demo-overlay">
            <div className="demo-text">Watch and Learn!</div>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="control-row">
          <button className="btn btn-clear" onClick={clearCanvas}>
            Clear
          </button>
          <button className="btn btn-demo" onClick={showDemonstration}>
            Show Me
          </button>
        </div>
        <div className="control-row">
          <button className="btn btn-prev" onClick={previousLetter}>
            Previous
          </button>
          <button className="btn btn-next" onClick={nextLetter}>
            Next
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stroke-counter">
          Strokes: <span className="count">{strokeCount}</span>
        </div>
      </div>

      <div className="letter-grid">
        <h3>Choose a Letter:</h3>
        <div className="grid">
          {alphabet.split('').map(letter => (
            <button
              key={letter}
              className={`letter-btn ${currentLetter === letter ? 'active' : ''} ${
                completedLetters.has(letter) ? 'completed' : ''
              }`}
              onClick={() => selectLetter(letter)}
            >
              {letter}
              {completedLetters.has(letter) && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>

    
  );
};

export default AlphabetWriter;