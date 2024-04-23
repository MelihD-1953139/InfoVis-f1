import React, { useState } from 'react';

function SelectRace() {
    const [year, setYear] = useState(1996);
    const [circuit, setCircuit] = useState("select circuit");
    const [data, setData] = useState([{}]);
    const [round, setRound] = useState(0);
    const [selectedDrivers, setSelectedDrivers] = useState([]); 

    const years = Array.from({ length: 29 }, (_, index) => 1996 + index);

    const fetchData = () => {
        console.log(round);
        let driverselect = document.getElementById("drivers");
        driverselect.innerHTML = "";
        fetch("https://ergast.com/api/f1/" + year + "/" + round + "/results.json")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setData(data);
                console.log(data);
                // add a selection to choose a driver from this race
                for (let i = 0; i < data.MRData.RaceTable.Races[0].Results.length; i++) {
                    let option = document.createElement("option");
                    option.text = data.MRData.RaceTable.Races[0].Results[i].Driver.driverId
                    option.value = data.MRData.RaceTable.Races[0].Results[i].Driver.driverId
                    driverselect.add(option);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    const getRoundNumber = (year, circuit) => {
        fetch("https://ergast.com/api/f1/" + year + ".json")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                for (let i = 0; i < data.MRData.RaceTable.Races.length; i++) {
                    if (data.MRData.RaceTable.Races[i].Circuit.circuitId === circuit) {
                        console.log(data.MRData.RaceTable.Races[i].Circuit.circuitId);
                        console.log(circuit);
                        setRound(data.MRData.RaceTable.Races[i].round);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    const yearHandler = (e) => {
        setYear(e);

        // Empty the circuits dropdown
        let circuitselect = document.getElementById("circuits");
        circuitselect.innerHTML = "";
        let driverselect = document.getElementById("drivers");
        driverselect.innerHTML = "";

        fetch("https://ergast.com/api/f1/" + e + "/circuits.json")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                circuitselect = document.getElementById("circuits");
                for (let i = 0; i < data.MRData.CircuitTable.Circuits.length; i++) {
                    let option = document.createElement("option");
                    option.text = data.MRData.CircuitTable.Circuits[i].circuitName;
                    option.value = data.MRData.CircuitTable.Circuits[i].circuitId;
                    circuitselect.add(option);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    function circuitHandler(e) {
        setCircuit(e);
        getRoundNumber(year, e);
        fetchData();
    }

    function addDriver() {
        let driverselect = document.getElementById("drivers");
        let selected = driverselect.options[driverselect.selectedIndex].value;
        if (selectedDrivers.includes(selected)) {
            return;
        }
        selectedDrivers.push(selected);
        let driverslist = document.getElementById("driversList");
        driverslist.innerHTML = "";
        for (let i = 0; i < selectedDrivers.length; i++) {
            let driver = document.createElement("div");
            driver.className = "driver";
            // add name, image and delete button to driver list
            let driverimage = document.createElement("img");
            driverimage.src = "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Driver%20profile%20images%202018/hamilton.png.transform/4col/image.png";
            driver.appendChild(driverimage);
            let drivername = document.createElement("p");
            drivername.innerHTML = selectedDrivers[i];
            driver.appendChild(drivername);
            let deletebutton = document.createElement("button");
            deletebutton.innerHTML = "delete";
            // Use a closure to capture the correct value of i
            deletebutton.onclick = (function(index) {
                return function() {
                    selectedDrivers.splice(index, 1);
                    addDriver();
                };
            })(i);
            driver.appendChild(deletebutton);
            driverslist.appendChild(driver);
        }
    }

    return (
        <div id="drivercompare">
            <div id="compareform">
                <label htmlFor="year-select">Select Year:</label>
                <select id="years" value={year} onChange={(e) => yearHandler(e.target.value)} onLoad={(e) => yearHandler(e.target.value)}>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <label htmlFor="circuit-select">Select Circuit:</label>
                <select id="circuits" value={circuit} onChange={(e) => circuitHandler(e.target.value)}>
                    {/* Options for circuits */}
                </select>
                <div id="driverselect">
                    <label htmlFor="drivers">Select Driver:</label>
                    <select id="drivers" multiple>
                    </select>
                </div>
                <button id="addDriver" onClick={addDriver}>add driver</button>
            </div>
            <div id="driversList">
            </div>
        </div>
    );
}

export default SelectRace;
