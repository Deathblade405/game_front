import React, { useState } from "react";
import axios from "axios";
import './App.css'; // Assuming you have some styles in App.css

export default function CreateGame({ onGameCreated }) {
  const [creator, setCreator] = useState("Boss");
  const [maxNumber, setMaxNumber] = useState(4);
  const [selectedTiles, setSelectedTiles] = useState([]);

  const grid = Array(5).fill(null).map(() => Array(5).fill(null));

  const isSelected = (r, c) =>
    selectedTiles.some(tile => tile.position[0] === r && tile.position[1] === c);

  const toggleTile = (r, c) => {
    if (isSelected(r, c)) {
      setSelectedTiles(prev =>
        prev.filter(tile => !(tile.position[0] === r && tile.position[1] === c))
      );
    } else {
      if (selectedTiles.length < maxNumber) {
        setSelectedTiles(prev => [
          ...prev,
          { position: [r, c], number: prev.length + 1 }
        ]);
      }
    }
  };

  const createGame = async () => {
    if (selectedTiles.length !== maxNumber) {
      alert(`Please select exactly ${maxNumber} tiles.`);
      return;
    }
    try {
      const res = await axios.post("https://game-back-rwzz.onrender.com/games/", {
        creator,
        maxNumber,
        numberedTiles: selectedTiles
      });
      const gameId = res.data.game_id;
      alert("Game created! Game ID: " + gameId);
      onGameCreated(gameId);
    } catch (err) {
      alert("Error creating game: " + err.message);
    }
  };

  return (
    <div className="create">
      <h2>Create a Game</h2>
      <input
        type="number"
        value={Number.isNaN(maxNumber) ? "" : maxNumber}
        min={1}
        max={10}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          setMaxNumber(isNaN(value) ? "" : value);
        }}
        placeholder="Max number (1-10)"
      />
      <div className="grid">
        {grid.map((row, rIdx) =>
          row.map((_, cIdx) => {
            const tile = selectedTiles.find(
              t => t.position[0] === rIdx && t.position[1] === cIdx
            );
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`cell ${tile ? "path" : ""}`}
                onClick={() => toggleTile(rIdx, cIdx)}
              >
                {tile ? tile.number : ""}
              </div>
            );
          })
        )}
      </div>
      <button onClick={createGame}>Create Game</button>
    </div>
  );
}
