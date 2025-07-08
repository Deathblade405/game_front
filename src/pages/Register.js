// src/pages/Register.js
import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

export default function Register({ onBack }) {
  const [form, setForm] = useState({
    name: "", gamer_key: "", phone: "", password: "", role: "player"
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    try {
      await axios.post("https://game-back-rwzz.onrender.com/auth/register", form);
      alert("✅ Registered successfully. Now login.");
      onBack(); // 🔁 go back to login
    } catch (err) {
      alert("❌ " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {["name", "gamer_key", "phone", "password"].map(field => (
        <input
          key={field}
          type={field === "password" ? "password" : "text"}
          name={field}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
        />
      ))}
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="boss">Boss</option>
        <option value="player">Player</option>
      </select>
      <div className="auth-buttons">
        <button onClick={register}>Register</button>
        <button className="switch-btn" onClick={onBack}>⬅ Back to Login</button>
      </div>
    </div>
  );
}
