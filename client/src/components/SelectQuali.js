import React, { useState, useEffect } from 'react';

function SelectQuali({year, setYear, circuit, setCircuit, round, setRound, selectedDrivers, setSelectedDrivers, drivercodes, setDriverCodes, driverData, setDriverData, fastestLaps, setDriverColors}) {
    const [data, setData] = useState([{}]);
    const [positions, setPositions] = useState([{}]);

    const years = Array.from({ length: 29 }, (_, index) => 1996 + index);

    function SecondsToMinuteString(seconds){
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return minutes + ":" + remainingSeconds.toFixed(3);
    }

    function isValidJSON(str) {
        try {
          JSON.parse(str);
          return true;
        } catch (e) {
          return false;
        }
    };

    function fetchPositions(year, round) {
        fetch("https://ergast.com/api/f1/" + year + "/" + round + "/qualifying.json").then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        }).then(data => {
            let positionst = {};
            selectedDrivers.forEach(driver => {
                for (let i = 0; i < data.MRData.RaceTable.Races[0].QualifyingResults.length; i++) {
                    if (driver === data.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.driverId) {
                        positionst[driver] = data.MRData.RaceTable.Races[0].QualifyingResults[i].position;
                    }
                }
            });
            setPositions(positionst);
            console.log(positionst);
            
        }).catch(error => {
            console.error('Error fetching data:', error);
        });
    }

    const fetchDriverData = (year, round) => {
        if (drivercodes.length === 0) {
            return;
        }
        fetch("http://localhost:8000/driverinfo?year=" + year + "&round=" + round + "&drivers=" + drivercodes.join(","))
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setDriverData(data);
                console.log(data);
                let colors = {};
                drivercodes.forEach(driver => {
                    if (data[driver] !== undefined && isValidJSON(data[driver])) {
                        let driverinfo = JSON.parse(data[driver]);
                        colors[driver] = driverinfo["TeamColor"];
                    }
                        
                });
                setDriverColors(colors);
            })
    }


    const fetchData = () => {
        let driverselect = document.getElementById("drivers");
        driverselect.innerHTML = "";
        let driverslist = document.getElementById("driversList");
        driverslist.innerHTML = "";
        selectedDrivers = [];
        drivercodes = [];
        setSelectedDrivers([]);
        setDriverCodes([]);
        fetch("https://ergast.com/api/f1/" + year + "/" + round + "/qualifying.json")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setData(data);
                // add a selection to choose a driver from this race
                for (let i = 0; i < data.MRData.RaceTable.Races[0].QualifyingResults.length; i++) {
                    let option = document.createElement("option");
                    option.text = data.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.driverId
                    option.value = [data.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.driverId, data.MRData.RaceTable.Races[0].QualifyingResults[i].Driver.code];
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
        let driverslist = document.getElementById("driversList");
        driverslist.innerHTML = "";
        selectedDrivers = [];
        drivercodes = [];
        setSelectedDrivers([]);
        setDriverCodes([]);

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

    function addDriver(add = true) {
        let driverselect = document.getElementById("drivers");
        let selected = driverselect.options[driverselect.selectedIndex].value.split(',')[0];
        let drivercode = driverselect.options[driverselect.selectedIndex].value.split(',')[1];
        if (selectedDrivers.includes(selected)) {
            return;
        }
        const newSelectedDrivers = [...selectedDrivers, selected];
        const newDriverCodes = [...drivercodes, drivercode];
        setSelectedDrivers(newSelectedDrivers);
        setDriverCodes(newDriverCodes);
        renderDriverList(newSelectedDrivers);
    }
    
    function deleteDriver(driver) {
        const newSelectedDrivers = selectedDrivers.filter(d => d !== driver);
        const newDriverCodes = drivercodes.filter(code => code !== drivercodes[selectedDrivers.indexOf(driver)]);
        setSelectedDrivers(newSelectedDrivers);
        setDriverCodes(newDriverCodes);
        renderDriverList(newSelectedDrivers);
    }

    function renderDriverList(drivers, info = null) {
        let driverslist = document.getElementById("driversList");
        driverslist.innerHTML = "";
        for (let i = 0; i < drivers.length; i++) {
            let driver = document.createElement("div");
            driver.className = "driver";
    
            // Create container for top info
            let topInfo = document.createElement("div");
            topInfo.className = "top-info";
    
            // Create an image element for the driver's picture
            let driverimage = document.createElement("img");

            console.log(info);

            if (info && info[drivercodes[i]] !== undefined && isValidJSON(info[drivercodes[i]])) {
                let driverinfo = info[drivercodes[i]];

                driverinfo = JSON.parse(driverinfo);
                driverimage.src = driverinfo["HeadshotUrl"];
                
                // Driver name
                let identifydiv = document.createElement("div");
                identifydiv.className = "driver-identify";
                

                let drivername = document.createElement("p");
                drivername.className = "driver-name";
                drivername.innerHTML = drivers[i];
                topInfo.appendChild(driverimage);
                identifydiv.appendChild(drivername);

                let teamname = document.createElement("p");
                teamname.className = "team-name";
                teamname.innerHTML = driverinfo["TeamName"];
                identifydiv.appendChild(teamname);

                topInfo.appendChild(identifydiv);
    
                // Team Color Dot
                let teamColorDot = document.createElement("span");
                teamColorDot.className = "team-color-dot";
                teamColorDot.style.backgroundColor = `#${driverinfo["TeamColor"]}`;
                topInfo.appendChild(teamColorDot);
    
                // Delete button
                let deletebutton = document.createElement("button");
                deletebutton.innerHTML = "delete";
                deletebutton.onclick = (function (i) {
                    return function () {
                        deleteDriver(drivers[i]);
                    }
                })(i);
                topInfo.appendChild(deletebutton);
    
                // Append top info to driver div
                driver.appendChild(topInfo);
    
                // Statistics
                let stats = document.createElement("div");
                stats.className = "driver-stats";
    
                const createStatRow = (label, value, className = "") => {
                    let statRow = document.createElement("div");
                    statRow.className = "stat-row";
    
                    let statLabel = document.createElement("span");
                    statLabel.className = "stat-label";
                    statLabel.innerHTML = `${label}:`;
    
                    let statValue = document.createElement("span");
                    statValue.className = "stat-value" + (className ? " " + className : "");
                    statValue.innerHTML = value;
    
                    statRow.appendChild(statLabel);
                    statRow.appendChild(statValue);
                    stats.appendChild(statRow);
                };
                let classname = "";
                if (selectedDrivers.length > 1) {
                    let fastest = true;
                    let slowest = true;
                    for (let j = 0; j < drivers.length; j++) {
                        // check if valid json
                        if (parseInt(positions[selectedDrivers[j]])){
                            if (parseInt(positions[selectedDrivers[i]]) > parseInt(positions[selectedDrivers[j]])) {
                                fastest = false;
                            } 
                            if (parseInt(positions[selectedDrivers[i]]) < parseInt(positions[selectedDrivers[j]])) {
                                slowest = false;
                            }
                        }
                    }
                    if (fastest) {
                        classname = "fastest";
                    } else if (slowest) {
                        classname = "slowest";
                    }
                }   
                createStatRow("Position", positions[selectedDrivers[i]], classname);
                
    
                // Append stats to driver div
                driver.appendChild(stats);
            } else {
                driverimage.src = `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Driver%20profile%20images%202018/${drivers[i]}.png.transform/4col/image.png`;
                topInfo.appendChild(driverimage);
    
                // Driver name
                let drivername = document.createElement("p");
                drivername.className = "driver-name";
                drivername.innerHTML = drivers[i];
                topInfo.appendChild(drivername);
    
                // Delete button
                let deletebutton = document.createElement("button");
                deletebutton.innerHTML = "delete";
                deletebutton.onclick = (function (i) {
                    return function () {
                        deleteDriver(drivers[i]);
                    }
                })(i);
                topInfo.appendChild(deletebutton);
    
                // Append top info to driver div
                driver.appendChild(topInfo);
            }
    
            // Append the driver div to the list
            driverslist.appendChild(driver);
        }
    }
    
    useEffect(() => {
        renderDriverList(selectedDrivers, driverData);
    }, [positions, driverData]);
    
    useEffect(() => {
        fetchPositions(year, round);
    }, [driverData]);

    useEffect(() => {
        fetchDriverData(year, round);
    }, [drivercodes]);

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
                <button id="addDriver" onClick={(e) => addDriver()}>add driver</button>
            </div>
            <div id="driversList">
            </div>
            <div id="laptimeChart">
                {/* Display the lap time chart here */}
            </div>
        </div>
    );
}

export default SelectQuali;