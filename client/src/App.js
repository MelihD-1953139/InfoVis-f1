import React, { useState, useEffect } from 'react';
import DriverCompare from './components/DriverCompare';
import Standings from './components/Standings'; // Adjust the path as necessary


function App() {

    return (
        <div>
            <DriverCompare />
            <Standings />
        </div>
    );
}


export default App;
