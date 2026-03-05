import React from "react";
import { useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    alert("Registration Successful");

    navigate("/plant-request");
  };

  return (
    <div>
      <h2>Farmer Registration</h2>

      <form onSubmit={handleRegister}>

        <input type="text" placeholder="Full Name" />
        <br /><br />

        <input type="email" placeholder="Email" />
        <br /><br />

        <input type="password" placeholder="Password" />
        <br /><br />

        <button type="submit">Register</button>

      </form>
    </div>
  );
}

export default Register;