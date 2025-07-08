// src/pages/Dashboard.js
import React from "react";
import { useAuth } from "../AuthContext";
import CreateGame from "./CreateGame";  // for boss
import GameBoard from "./GameBoard";    // for player
import "./Dashboard.css"; // Assuming you have some styles for the dashboard
export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return <p>Not logged in</p>;

  return (
    <div className="dashboard">
      <h2>Welcome {user.name} ({user.role})</h2>
      <button onClick={logout}>Logout</button>
      {user.role === "boss" ? (
        <CreateGame onGameCreated={(id) => alert("Game ID: " + id)} />
      ) : (
        <GameBoard gameId="paste_game_id_here" />
      )}
    </div>
  );
}
