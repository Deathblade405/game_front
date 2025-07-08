// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./Login.css";

export default function Login({ onRegister }) {
  const [form, setForm] = useState({ phone: "", password: "" });
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://game-back-rwzz.onrender.com/auth/login", form);
      const { access_token, user } = res.data;
      login(user, access_token);
    } catch (err) {
      alert("❌ Login failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <div className="auth-buttons">
        <button onClick={handleLogin}>Login</button>
        <button className="switch-btn" onClick={onRegister}>Register</button>
      </div>
    </div>
  );
}
