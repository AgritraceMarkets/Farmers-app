import React from "react";

function Sidebar() {
  return (
    <div style={{
      width:"220px", 
      background:"#2c5034", 
      color:"white",
       height:"100vh",
       padding:"20px"}}>
      
      <h2>AgriTrace</h2>

      <ul style={{listStyle:"none", padding:"0"}}>
        <li style={{margin:"20px 0",cursor:"pointer"}}>Dashboard</li>
        <li style={{margin:"20px 0",cursor:"pointer"}}>Farmers</li>
        <li style={{margin:"20px 0",cursor:"pointer"}}>Crops</li>
        <li style={{margin:"20px 0",cursor:"pointer"}}>Reports</li>
      </ul>

    </div>
  );
}

export default Sidebar;