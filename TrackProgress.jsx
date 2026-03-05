import React, { useState } from "react";
import drop from "../images/drop.jpg";

function TrackProgress() {

  const [stage, setStage] = useState("Seed");

  const nextStage = () => {
    const stages = [
      "Seed",
      "Germination",
      "Seedling",
      "Vegetative",
      "Flowering",
      "Harvest"
    ];

    const currentIndex = stages.indexOf(stage);

    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1]);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${drop})`,
        backgroundSize: "cover",
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
        <h2>Crop Growth Tracking</h2>

        <p><b>Crop:</b> Maize</p>
        <p><b>Current Stage:</b> {stage}</p>

        <button onClick={nextStage}>
          Update Growth Stage
        </button>
      </div>
    </div>
  );
}

export default TrackProgress;