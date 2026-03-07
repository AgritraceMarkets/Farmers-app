import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    alert("Login Successful");

    navigate("/track-progress");
  };

  return (
    <div>
      <h2>Farmer Login</h2>

      <form onSubmit={handleLogin}>

        <input type="email" placeholder="Email" />
        <br /><br />

        <input type="password" placeholder="Password" />
        <br /><br />

        <button type="submit">Login</button>

      </form>
    </div>
  );
}

export default Login;