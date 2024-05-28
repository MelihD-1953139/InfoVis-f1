import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DriverCompare from './components/DriverCompare';
import Qualifying from './components/Qualifying';
import Season from "./components/Season";
import Racegraph from './components/racegraph';
import Standings from "./components/Standings";
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul className="nav-links">
            <li className="nav-item"><Link to="/">Standings</Link></li>
            <li className="nav-item"><Link to="/season">Season</Link></li>
            <li className="nav-item"><Link to="/racegraph">Racegraph</Link></li>
            <li className="nav-item"><Link to="/race_statistics">Race statistics</Link></li>
            <li className="nav-item"><Link to="/qualifying_statistics">Qualifying statistics</Link></li>
          </ul>
        </nav>

        <div className="content">
        <Routes>
          <Route path="/" element={<Standings />} />
          <Route path="/season" element={<Season />} />
          <Route path="/racegraph" element={<Racegraph />} />
          <Route path="/race_statistics" element={<DriverCompare />} />
          <Route path="/qualifying_statistics" element={ <Qualifying /> } />
        </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;