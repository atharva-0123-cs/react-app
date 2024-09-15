// import React from "react";
import "./App.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import DataTableComponent from "./DataTableComponent";

function App() {
  return (
    <div className="App">
      <h2>Art Institute of Chicago Artworks</h2>
      <DataTableComponent />
    </div>
  );
}

export default App;
