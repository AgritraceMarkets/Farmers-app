import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./src/Dashboard";
import Farmers from "./src/Farmers";
import Register from "./src/Register";
import Login from "./src/Login";
import PlantRequest from "./src/PlantRequest";
import TrackProgress from "./src/TrackProgress";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/farmers" element={<Farmers />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />
        <Route path="/plant-request" element={<PlantRequest />} /><Route path="/track-progress" element={<TrackProgress />} />

      </Routes>
    </Router>
  );
}

export default App;