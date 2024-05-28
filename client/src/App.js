import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DriverCompare from './components/DriverCompare';
import Qualifying from './components/Qualifying';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul className="nav-links">
            <li className="nav-item"><Link to="/race_statistics">Race statistics</Link></li>
            <li className="nav-item"><Link to="/qualifying_statistics">Qualifying statistics</Link></li>
          </ul>
        </nav>

        <div className="content">
        <Routes>
          <Route path="/" element={<div></div>} />
          <Route path="/race_statistics" element={<DriverCompare />} />
          <Route path="/qualifying_statistics" element={ <Qualifying /> } />
        </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;