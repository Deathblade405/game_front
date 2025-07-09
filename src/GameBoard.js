import React, { useEffect, useState, useRef, use } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Assuming you have an AuthContext for user authentication
import './App.css';

const GRID_SIZE = 5;

const isAdjacent = (a, b) => {
  const dx = Math.abs(a[0] - b[0]);
  const dy = Math.abs(a[1] - b[1]);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

export default function GameBoard({ gameId }) {
  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [mainTimer, setMainTimer] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [attemptCount, setAttemptCount] = useState(1);
  const [timerStopped, setTimerStopped] = useState(false);
  const [maxNumber, setMaxNumber] = useState(null);
  const { user } = useAuth(); // Assuming useAuth is defined in your context
  const gridRef = useRef(null); // 📌 Add ref for touch handling

  useEffect(() => {
    const loadGame = async () => {
      const res = await axios.get(`https://game-back-rwzz.onrender.com/games/${gameId}`);
      const game = res.data;
      const g = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
      game.numberedTiles.forEach((tile) => {
        const [r, c] = tile.position;
        g[r][c] = tile.number;
      });
      setGrid(g);
      setStartTime(Date.now());
      setMainTimer(0);
      setAttempts([]);
      setAttemptCount(1);
      setTimerStopped(false);
      setMaxNumber(game.maxNumber);
    };
    loadGame();
  }, [gameId]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (startTime && !timerStopped) {
        setMainTimer(((Date.now() - startTime) / 1000).toFixed(1));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, timerStopped]);

  const isInPath = (r, c) => path.some((p) => p[0] === r && p[1] === c);

  const handleTile = (r, c) => {
    const curr = [r, c];
    if (isInPath(r, c)) return;
    if (currentTarget > maxNumber) return;

    if (path.length === 0) {
      if (grid[r][c] !== 1) return;
      setPath([curr]);
      setCurrentTarget(2);
      return;
    }

    const last = path[path.length - 1];
    if (!isAdjacent(last, curr)) return;

    const cellValue = grid[r][c];
    if (cellValue) {
      if (cellValue !== currentTarget) return;
      setCurrentTarget(currentTarget + 1);
    }

    if (currentTarget > maxNumber) return;

    setPath((prev) => [...prev, curr]);

    if (path.length + 1 === 25 && currentTarget === maxNumber) {
      onSuccess([...path, curr]);
    }
  };

  const getTileFromTouch = (touch) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / GRID_SIZE;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return [row, col];
    }
    return null;
  };

  const checkValid = (submittedPath) => {
    if (submittedPath.length !== 25) return false;
    const visited = new Set();
    submittedPath.forEach(([r, c]) => {
      const val = grid[r][c];
      if (val) visited.add(val);
    });
    for (let i = 1; i <= maxNumber; i++) {
      if (!visited.has(i)) return false;
    }
    return true;
  };

  const onSuccess = async (finalPath) => {
    const subTime = (Date.now() - startTime) / 1000;
    const valid = checkValid(finalPath);

    if (!valid) {
      alert("❌ Invalid path! Must use all tiles and all numbers.");
      setPath([]);
      setCurrentTarget(1);
      return;
    }

    setTimerStopped(true);

    await axios.post(`https://game-back-rwzz.onrender.com/games/${gameId}/attempt`, {
      player: user?.name || "unknown",
      path: finalPath,
      duration: subTime,
      successful: true,
      mainTime: subTime
    });

    const again = window.confirm(`🎉 Congrats! You completed the game in ${subTime.toFixed(2)}s.\nDo you want to play again?`);

    if (again) {
      setPath([]);
      setCurrentTarget(1);
      setAttemptCount(1);
      setAttempts([]);
      setStartTime(Date.now());
      setTimerStopped(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const clearAttempt = () => {
    if (timerStopped) return;
    const currentTime = ((Date.now() - startTime) / 1000).toFixed(1);
    setAttempts((prev) => [...prev, { attempt: attemptCount, time: currentTime }]);
    setAttemptCount((prev) => prev + 1);
    setPath([]);
    setCurrentTarget(1);
  };

  const generateSmoothPath = () => {
    if (path.length === 0) return "";
    const coords = path.map(([r, c]) => [c * 60 + 30, r * 60 + 30]);
    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      const [x1, y1] = coords[i - 1];
      const [x2, y2] = coords[i];
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      d += ` Q ${x1},${y1} ${mx},${my}`;
    }
    const [lastX, lastY] = coords[coords.length - 1];
    d += ` T ${lastX},${lastY}`;
    return d;
  };

  return (
    <div
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchEnd={() => setDragging(false)}
      style={{
        userSelect: "none",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "2rem",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div>
        <h2>Player Mode</h2>
        <div
          className="grid-container"
          style={{ position: "relative", width: 300, height: 300 }}
        >
          {/* Path SVG */}
          <svg className="path-svg">
            <path
              d={generateSmoothPath()}
              fill="none"
              stroke="red"
              strokeWidth="25"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.5}
              style={{ filter: "drop-shadow(0 0 5px rgba(242, 0, 0, 0.8))" }}
            />
          </svg>

          {/* Grid Tiles */}
          <div
            className="grid"
            ref={gridRef}
            onTouchMove={(e) => {
              if (!dragging) return;
              const touch = e.touches[0];
              const tile = getTileFromTouch(touch);
              if (tile) handleTile(tile[0], tile[1]);
            }}
          >
            {grid.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="cell"
                  onMouseDown={() => {
                    setDragging(true);
                    handleTile(r, c);
                  }}
                  onMouseEnter={() => {
                    if (dragging) handleTile(r, c);
                  }}
                  onTouchStart={() => {
                    setDragging(true);
                    handleTile(r, c);
                  }}
                >
                  {val}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={clearAttempt}>Clear</button>
          <p>Tiles used: {path.length} / 25</p>
        </div>
      </div>

      <div style={{ minWidth: "200px", textAlign: "center" }}>
        <h3>Main Timer</h3>
        <p>{mainTimer}s</p>
        <h4>Attempts</h4>
        <ul>
          {attempts.map((a) => (
            <li key={a.attempt}>
              Attempt {a.attempt}: {a.time}s
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
