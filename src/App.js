import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import CreateGame from './CreateGame';
import Register from './pages/Register';
import Login from './pages/Login';
import { useAuth } from './AuthContext';
import './App.css';

export default function App() {
  const { user, logout } = useAuth();
  const [gameId, setGameId] = useState("");
  const [inputGameId, setInputGameId] = useState("");
  const [showRegister, setShowRegister] = useState(false); // 🔁 toggle view

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    // Optional: rehydrate user here if needed
  }, []);

  // 1. Not logged in → show Login or Register
  if (!user) {
    return (
      <div className="app">
        <h1>Welcome to Grid Connect Game</h1>
        {showRegister ? (
          <Register onBack={() => setShowRegister(false)} />
        ) : (
          <Login onRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  // 2. Logged in as Boss
  if (user.role === 'boss') {
    return (
      <div className="app">
        <h2>Welcome Boss: {user.name}</h2>
        <button onClick={logout}>Logout</button>
        {!gameId ? (
          <CreateGame onGameCreated={setGameId} />
        ) : (
          <GameBoard gameId={gameId} />
        )}
      </div>
    );
  }

  // 3. Logged in as Player
  if (user.role === 'player') {
    return (
      <div className="app">
        <h2>Welcome Player: {user.name}</h2>
        <button onClick={logout}>Logout</button>
        {!gameId ? (
          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="Enter Game ID"
              value={inputGameId}
              onChange={(e) => setInputGameId(e.target.value)}
            />
            <button onClick={() => setGameId(inputGameId)}>Join Game</button>
          </div>
        ) : (
          <GameBoard gameId={gameId} />
        )}
      </div>
    );
  }

  return null;
}
