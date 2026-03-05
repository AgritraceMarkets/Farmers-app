import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Farmers from "./pages/Farmers";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PlantRequest from "./pages/PlantRequest";
import TrackProgress from "./pages/TrackProgress";


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