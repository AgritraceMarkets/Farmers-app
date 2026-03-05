import React from "react";
import { Link } from "react-router-dom";

function Farmers() {
  return (
    <div>

      <h2>Farmers Section</h2>

      <ul>
        <li>
          <Link to="/register">Registration Page</Link>
        </li>

        <li>
          <Link to="/login">Log In Page</Link>
        </li>
      </ul>

    </div>
  );
}

export default Farmers;