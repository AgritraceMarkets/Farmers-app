import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import Farmers from "./Farmers";
import Register from "./Register";
import Login from "./Login";
import PlantRequest from "./PlantRequest";
import TrackProgress from "./TrackProgress";


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