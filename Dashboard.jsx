import React from "react";
import { Link } from "react-router-dom";
import tea from "../hill.jpg";

function Dashboard() {
  return (
    <div style={{ textAlign: "center" }}>
      
      <h1>AgriTrace system</h1>

      <div
        style={{
          backgroundImage: `url(${tea})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold"
        }}
      >
        <Link to="/farmers" style={{ color: "white", textDecoration: "none" }}>
          Farmers
        </Link>

        <div>Market Place</div>

        <div>Buyers</div>
      </div>

    </div>
  );
}

export default Dashboard;