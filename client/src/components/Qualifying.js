import { useEffect, useState } from "react";
import SelectQuali from "./SelectQuali";
import QualiView from "./QualiView";

function Qualifying() {
    const [year, setYear] = useState(1996);
    const [circuit, setCircuit] = useState("select circuit");
    const [round, setRound] = useState(1);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [drivercodes, setDriverCodes] = useState([]);
    const [driverData, setDriverData] = useState([{}]);
    const [fastestLaps, setFastestLaps] = useState([{}]);
    const [driverColors, setDriverColors] = useState({});

    return (
        <div className="comparecontainer"> {/* Use className for styling */}
            <SelectQuali 
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
                driverData={driverData}
                setDriverData={setDriverData}
                fastestLaps={fastestLaps}
                setDriverColors={setDriverColors}
            />
            <QualiView 
                year={year}
                circuitId={circuit}
                session={round}
                SelectedDrivers={selectedDrivers}
                setFastestLaps={setFastestLaps}
                DriverCodes={drivercodes}
                DriverColors={driverColors}
            />
        </div>

    );
}

export default Qualifying;