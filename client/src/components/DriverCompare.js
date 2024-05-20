import React, { useState } from "react";
import SelectRace from "./SelectRace";
import LapGraph from "./LapGraph";
import "./DriverCompare.css"; // Import CSS file for styling
import Racegraph from "./racegraph";

function DriverCompare() {

    const [year, setYear] = useState(1996);
    const [circuit, setCircuit] = useState("select circuit");
    const [round, setRound] = useState(1);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [drivercodes, setDriverCodes] = useState([]);

    return (
        <div>
            <div className="comparecontainer"> {/* Use className for styling */}
                <SelectRace
                    year={year}
                    setYear={setYear}
                    circuit={circuit}
                    setCircuit={setCircuit}
                    round={round}
                    setRound={setRound}
                    selectedDrivers={selectedDrivers}
                    setSelectedDrivers={setSelectedDrivers}
                    drivercodes={drivercodes}
                    setDriverCodes={setDriverCodes}
                />
                <LapGraph
                    year={year}
                    session={round}
                    selectedDrivers={selectedDrivers}
                    drivercodes={drivercodes}
                />

            </div>
            <div>
                <Racegraph year={year} session={round} selectedDrivers={selectedDrivers} drivercodes={drivercodes} />
            </div>
        </div>
    );

}

export default DriverCompare;
