import React, { useState } from 'react';
import GameBoard from './GameBoard';
import CreateGame from './CreateGame';
import './App.css';
export default function App() {
  const [gameId, setGameId] = useState("");
  const [mode, setMode] = useState(""); // "", "boss", "player"

  const [inputGameId, setInputGameId] = useState("");

  if (mode === "") {
    return (
      <div className="app">
        <h1>Connect game</h1>
        <button onClick={() => setMode("boss")}>Create Game (Boss)</button>
        <button onClick={() => setMode("player")}>Join Game (Player)</button>
      </div>
    );
  }

  if (mode === "boss" && !gameId) {
    return <CreateGame onGameCreated={setGameId} />;
  }

  if (mode === "player" && !gameId) {
    return (
      <div className="app">
        <h2>Enter Game ID</h2>
        <input
          type="text"
          placeholder="Game ID"
          value={inputGameId}
          onChange={(e) => setInputGameId(e.target.value)}
        />
        <button onClick={() => setGameId(inputGameId)}>Play</button>
        <button onClick={() => setMode("")}>⬅ Back</button>
      </div>
    );
  }

  return <GameBoard gameId={gameId} />;
}
