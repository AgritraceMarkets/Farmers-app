import React, { useState } from "react";
import drop from "../images/drop.jpg";

function PlantRequest() {
  const [crop, setCrop] = useState("");
  const [date, setDate] = useState("");
  const [stage, setStage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStage("Seedling Stage");
  };

  return (
    <div
      style={{
        backgroundImage: `url(${drop})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          padding: "30px",
          borderRadius: "10px",
          textAlign: "center"
        }}
      >
        <h2>Planting Request</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Crop Name"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          />

          <br /><br />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <br /><br />

          <button type="submit">Request to Plant</button>
        </form>

        {stage && (
          <div style={{ marginTop: "20px" }}>
            <h3>Crop Growth Tracking</h3>

            <p><b>Crop:</b> {crop}</p>
            <p><b>Planting Date:</b> {date}</p>
            <p><b>Current Stage:</b> {stage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantRequest;