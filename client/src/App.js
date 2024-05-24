import React, { useState } from 'react';

import DriverCompare from './components/DriverCompare';
import Standings from './components/Standings';
import Racegraph from './components/racegraph';

function App() {
    const [activeTab, setActiveTab] = useState('Standings');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center pt-2  ">
                <header className="text-black w-full flex justify-center border-bottom pb-3 border-black">
                    <div className="flex">
                        <button
                            type="button"
                            className={`btn btn-outline-dark mx-2 ${activeTab === 'Standings' && 'btn-dark text-white'}`}
                            onClick={() => handleTabClick('Standings')}
                        >
                            Standings
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-dark mx-2 ${activeTab === 'Race' && 'btn-dark text-white'}`}
                            onClick={() => handleTabClick('Race')}
                        >
                            Race
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-dark mx-2 ${activeTab === 'DriverCompare' && 'btn-dark text-white'}`}
                            onClick={() => handleTabClick('DriverCompare')}
                        >
                            DriverCompare
                        </button>
                    </div>
                </header>
            </div>
            {activeTab === 'Standings' && <Standings />}
            {activeTab === 'Race' && <Racegraph />}
            {activeTab === 'DriverCompare' && <DriverCompare />}
        </div>

    );
}

export default App;
