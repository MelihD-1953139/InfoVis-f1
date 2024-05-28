import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Racegraph from './racegraph.js';
import LapTimesTable from './LapTimesTable.js';

Chart.register(...registerables);

function LapGraph({ year, circuitID, session, selectedDrivers, drivercodes, driverData, setDriverData, setFastestLaps }) {
    const [Racedata, setRaceData] = useState([{}]);
    const [labels, setLabels] = useState([]);
    const [lapTimes, setLapTimes] = useState([{}]);
    const [tyreData, setTyreData] = useState([{}]);
    const [tyrecolors, setTyreColors] = useState([]);
    const [driverColors, setDriverColors] = useState({}); 
    const [pitstopData, setPitstopData] = useState([{}]);
    const [numLaps, setNumLaps] = useState(0);
    const [circuit, setCircuit] = useState("/assets/f1_2020/australia.svg");
    const [lapPositions, setLapPositions] = useState([{}]);
    const [filteredLapTimes, setFilteredLapTimes] = useState([{}]);

    function loadCircuit(circuit_id){
        let url = "";
    
        switch (circuit_id) {
            case "albert_park":
                url += "/assets/f1_2020/australia.svg";
                break;
            case "americas":
                url += "/assets/f1_2020/usa.svg";
                break;
            case "bahrain":
                url += "/assets/f1_2020/bahrain.svg";
                break;
            case "baku":
                url += "/assets/f1_2020/azerbaijan.svg";
                break;
            case "catalunya":
                url += "/assets/f1_2020/spain.svg";
                break;
            case "hungaroring":
                url += "/assets/f1_2020/hungary.svg";
                break;
            case "interlagos":
                url += "/assets/f1_2020/brazil.svg";
                break;
            case "marina_bay":
                url += "/assets/f1_2020/singapore.svg";
                break;
            case "monaco":
                url += "/assets/f1_2020/monaco.svg";
                break;
            case "monza":
                url += "/assets/f1_2020/italy.svg";
                break;
            case "red_bull_ring":
                url += "/assets/f1_2020/austria.svg";
                break;
            case "rodriguez":
                url += "/assets/f1_2020/mexico.svg";
                break;
            case "shanghai":
                url += "/assets/f1_2020/china.svg";
                break;
            case "silverstone":
                url += "/assets/f1_2020/greatbritain.svg";
                break;
            case "sochi":
                url += "/assets/f1_2020/russia.svg";
                break;
            case "spa":
                url += "/assets/f1_2020/belgium.svg";
                break;
            case "suzuka":
                url += "/assets/f1_2020/japan.svg";
                break;
            case "villeneuve":
                url += "/assets/f1_2020/canada.svg";
                break;
            case "yas_marina":
                url += "/assets/f1_2020/abudhabi.svg";
                break;
            case "zandvoort":
                url += "/assets/f1_2020/netherlands.svg";
                break;
            default:
                url += "/assets/f1_2020/australia.svg";
        }
    
        setCircuit(url);
    }

    function convertToSeconds(timeStr) {
        // Split the string by ':'
        const parts = timeStr.split(':');
        
        // Parse minutes and seconds
        const minutes = parseInt(parts[0], 10);
        const seconds = parseFloat(parts[1]);
        
        // Calculate total seconds
        const totalSeconds = (minutes * 60) + seconds;
        
        return totalSeconds;
      }
      
  
    useEffect(() => {
        console.log("Huh yeah huh");
    }, [driverColors]);

    useEffect(() => {
        loadCircuit(circuitID);
    }, [circuitID]);
  

    useEffect(() => {
        fetchData();
    }, [selectedDrivers]);

    useEffect(() => {
        getTyreData();
    }, [lapTimes]);

    useEffect(() => {
        getDriverInfo();
    }, [tyrecolors]);

    useEffect(() => {
        getPitStopData();
    }, [driverColors]);



    const fetchData = () => {
        setLabels([]);
        setLapTimes({});
        setLapPositions({});
        fetch("https://ergast.com/api/f1/" + year + "/" + session + "/laps.json?limit=10000")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setRaceData(data);
                let laps = data.MRData.RaceTable.Races[0].Laps;
                let timings = {};
                let positions = {};
                setNumLaps(laps.length);
                let fastestlaps = {};
                for (let i = 0; i < laps.length; i++) {
                    setLabels(labels => [...labels, laps[i].number]);
                    selectedDrivers.map((driver) => {
                        if (!positions[driver]) {
                            positions[driver] = [];
                        }
                        if (!timings[driver]) {
                            timings[driver] = [];
                        }
                        for (let j = 0; j < laps[i]["Timings"].length; j++) {
                            let time = undefined;
                            if (laps[i]["Timings"][j].driverId === driver) {
                                time = laps[i]["Timings"][j];
                                positions[driver].push(laps[i]["Timings"][j].position);
                            }
                            if (time) {
                                timings[driver].push(convertToSeconds(time.time));
                            }
                        }
                        
                        
                    });
                    selectedDrivers.map((driver) => {
                        if (!fastestlaps[driver]) {
                            fastestlaps[driver] = undefined;
                        }
                        timings[driver].forEach((time) => {
                            if (fastestlaps[driver] === undefined || time < fastestlaps[driver]) {
                                fastestlaps[driver] = time;
                            }
                        });
                    });
                }
                console.log("timings:");
                console.log(timings);
                setLapPositions(positions);
                setLapTimes(timings);
                setFastestLaps(fastestlaps);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    function getPitStopData() {
        fetch(`https://ergast.com/api/f1/${year}/${session}/pitstops.json?limit=1000`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                let pitstops = data.MRData.RaceTable.Races[0].PitStops;
                setPitstopData(pitstops);
                console.log(pitstops);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }


    function getDriverInfo() {
        fetch(`http://localhost:8000/driverinfo?year=${year}&round=${session}&drivers=${drivercodes.join(',')}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                // Display the lap time chart here
                console.log(data);
                setDriverData(data);
                let colors = {};
                for (let i = 0; i < drivercodes.length; i++) {
                    let color = getTeamColor(drivercodes[i]);
                    colors[drivercodes[i]] = color;
                }   
                setDriverColors(colors);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    function getTyreData() {
        if (selectedDrivers.length === 0) {
            return;
        }
        fetch(`http://localhost:8000/tyres?year=${year}&round=${session}&drivers=${drivercodes.join(',')}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                // a dictionary with drivercode as keys and array of compounds as values is returned
                // read this array in into tyreData
                setTyreData(data);
                let tcolors = [];
                for (let i = 0; i < drivercodes.length; i++) {
                    let drivercolors = [];
                    let driver = drivercodes[i];
                    for (let j = 0; j < data[driver].length; j++) {
                        drivercolors.push(getTyreColor(data[driver][j]));
                    }
                    tcolors.push(drivercolors);
                }
                setTyreColors(tcolors);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    const getTyreColor = (tyre) => {
        // Define colors for different tire compounds
        const colorMap = {
            'WET': '#0000ff',//blue
            'SOFT': '#ff0000', // Red
            'MEDIUM': '#ffff00', // Yellow
            'HARD': '#ffffff', // white
            'INTERMEDIATE': '#008000', // Green
            'SUPERSOFT': '#b907ee', // Purple
            // Add more colors as needed for different tire compounds
        };

        return colorMap[tyre] || 'rgba(0, 0, 0, 0.8)'; // Default color for unknown tire compounds
    };

    function getTeamColor(drivercode) {
        // Generate random color for the line
        if (driverData){
            if (driverData[drivercode]) {
                let json = driverData[drivercode];
                json = JSON.parse(json);
                return json["TeamColor"];
            } else{
                console.log("No data for driver: " + drivercode)
                console.log(driverData);
            }
        } else {
            console.log("No data for driver: " + drivercode)
            console.log(driverData);
        }
        //return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    useEffect(() => {
        fetchData();
        getTyreData();
    }, []); // Fetch data when component mounts

    function calcTimeDiffMean(laptimesDriver) {
        // Calculate the difference between the mean time of selected drivers and the time of the current driver
        // for every lap...
        let means = [];
        // iterate trough the laptimes dictionary
    
        for (let i = 0; i < laptimesDriver.length; i++) {
            let currentlap = [];
            selectedDrivers.map((driver, index) => {
                if (lapTimes[driver] !== undefined && lapTimes[driver].length > i){
                    if (excludePitStops && filteredLapTimes[driver] !== undefined && filteredLapTimes[driver].length > 0) {
                        currentlap.push(filteredLapTimes[driver][i]);
                    } else {
                        currentlap.push(lapTimes[driver][i]);

                    }

                }
            });
            means.push(currentlap.reduce((a, b) => a + b, 0) / currentlap.length);
        }

        //calculate the difference between the mean time and the time of the current driver
        for (let i = 0; i < laptimesDriver.length; i++) {
            laptimesDriver[i] = laptimesDriver[i] - means[i];
        }

        return laptimesDriver;
    }

    function calcTimeDiffFastest(laptimesDriver) {
        let fastests = [];
        if (selectedDrivers.length === 0) {
            return laptimesDriver;
        }

        for (let i = 0; i < lapTimes.length; i++){
            let fastest = Math.min(...lapTimes[i]);
            fastests.push(fastest);
        }


        //calculate the difference between the mean time and the time of the current driver
        for (let i = 0; i < laptimesDriver.length; i++) {
            laptimesDriver[i] = laptimesDriver[i] - fastests[i];
        }

        return laptimesDriver;
    }

    const [excludePitStops, setExcludePitStops] = useState(false);

    function filterLapTimes() {
        setExcludePitStops(!excludePitStops);
        let filteredLapTimes = {};
        selectedDrivers.map((driver, index) => {
            let pitstops = {};

            for (let i = 0; i < lapTimes[driver].length; i++) {
                pitstops[i] = 0;
                pitstopData.forEach(element => {
                    if (parseInt(element.lap) === i+1 && element.driverId === driver) {
                        pitstops[i] = parseFloat(element.duration);
                        console.log("pitstop found: " + parseFloat(element.duration));
                    }
                });
            }
            
            console.log("pitstops");
            console.log(pitstops);

            let filteredDriverLaps = [];
            // iterate through the laptimes dict
            if (lapTimes[driver] !== undefined) {
                lapTimes[driver].forEach((laptime, index) => {
                    if (pitstops[index] === 0 || pitstops[index] === undefined) {
                        filteredDriverLaps.push(laptime);
                    } else
                    filteredDriverLaps.push(laptime - pitstops[index]);
                });
            }
            filteredLapTimes[driver] = filteredDriverLaps;
            console.log("filteredLapTimes");
            console.log(filteredLapTimes);  
        });
        setFilteredLapTimes(filteredLapTimes);
    }


    function switchPitstopState() {
        setExcludePitStops(!excludePitStops);
    }

    return (
        <div id="graphcontainer">
            <div class="session__header">
                <div>
                <h1>{circuitID}</h1>
                <h2>{year}</h2>
                </div>
                <img src={circuit} alt="circuitmap" />
            </div>

            <button onClick={filterLapTimes}>
                {excludePitStops ? 'Exclude Pit Stops' : 'Include Pit Stops' }
            </button>

            {selectedDrivers.length > 0 && (
                <Line
                    data={{
                        labels: labels.map((lap) => `${lap}`),
                        datasets: selectedDrivers.map((driver, index) => {
                            let laptimes = [];
                            let dotColors = []; // Create a separate array for dot colors
                            let lineColors = driverColors[drivercodes[index]]; // Use driverColors object to get color
                            
                            if (!excludePitStops && lapTimes[driver] !== undefined) {
                                for (let i = 0; i < lapTimes[driver].length; i++) {
                                    laptimes.push(lapTimes[driver][i]);
                                    if (tyrecolors[index]) {
                                        dotColors.push(tyrecolors[index][i]);
                                    }
                                }
                            } else if (filteredLapTimes[driver] !== undefined) {
                                for (let i = 0; i < filteredLapTimes[driver].length; i++) {
                                    laptimes.push(filteredLapTimes[driver][i]);
                                    if (tyrecolors[index]) {
                                        dotColors.push(tyrecolors[index][i]);
                                    }
                                }
                            }
                            
                            return {
                                label: driver,
                                data: laptimes,
                                fill: false,
                                borderColor: lineColors ? '#' + lineColors : 'rgba(0, 0, 0, 0.8)', // Use the driver color for borderColor
                                backgroundColor: dotColors, // Use the colors array for backgroundColor
                                pointBackgroundColor: dotColors, // Use the colors array for pointBackgroundColor
                                // bigger point size
                                pointRadius: 3.5,
                                tension: 0.1
                            };
                        }).filter(dataset => dataset !== null) // Filter out null datasets
                    }}
                    height={600}
                    width={1000}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: 'Laptimes'
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Lap'
                                }
                            },
                            y: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Time (seconds)'
                                }
                            }
                        }
                    }}
                />
            )}
            <Line
                data={{
                    labels: labels.map((lap) => `${lap}`),
                    datasets: selectedDrivers.map((driver, index) => {
                        let laptimes = [];
                        let dotColors = []; // Create a separate array for dot colors
                        let lineColors = driverColors[drivercodes[index]]; // Use driverColors object to get color
                        if (!excludePitStops && lapTimes[driver] !== undefined) {
                            for (let i = 0; i < lapTimes[driver].length; i++) {
                                laptimes.push(lapTimes[driver][i]);
                                if (tyrecolors[index]) {
                                    dotColors.push(tyrecolors[index][i]);
                                }
                            }
                            laptimes = calcTimeDiffMean(laptimes);
                        } else if (filteredLapTimes[driver] !== undefined) {
                            for (let i = 0; i < filteredLapTimes[driver].length; i++) {
                                laptimes.push(filteredLapTimes[driver][i]);
                                if (tyrecolors[index]) {
                                    dotColors.push(tyrecolors[index][i]);
                                }
                            }
                            laptimes = calcTimeDiffMean(laptimes);
                        }
                        
                        return {
                            label: driver,
                            data: laptimes,
                            fill: false,
                            borderColor: '#' + lineColors, // Use the random color for borderColor
                            backgroundColor: dotColors, // Use the colors array for backgroundColor
                            pointBackgroundColor: dotColors, // Use the colors array for pointBackgroundColor
                            // bigger point size
                            pointRadius: 3.5,
                            tension: 0.1
                        };
                    }).filter(dataset => dataset !== null) // Filter out null datasets
                }}
                height={600}
                width={1000}
                options={{
                    plugins: {
                        title: {
                            display: true,
                            text: 'Difference from mean laptime'
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            title: {
                                display: true,
                                text: 'Lap'
                            }
                        },
                        y: {
                            type: 'linear',
                            title: {
                                display: true,
                                text: 'Difference from mean laptime (seconds)'
                            }
                        }
                    }
                }}
            />
            <LapTimesTable SelectedDrivers={selectedDrivers} Laptimes={lapTimes} numLaps={numLaps}/>
            {selectedDrivers.length > 0 !== undefined &&(
                <Line
                    data={{
                        labels: labels.map((lap) => `${lap}`),
                        datasets: selectedDrivers.map((driver, index) => {
                            let lineColors = driverColors[drivercodes[index]];
                            let dotColors = [];
                            if (lapPositions[driver] !== undefined) {
                                for (let i = 0; i < lapPositions[driver].length; i++) {
                                    if (tyrecolors[index]) {
                                        dotColors.push(tyrecolors[index][i]);
                                    }
                                }
                            }
                            return {
                                label: driver,
                                data: lapPositions[driver], 
                                fill: false,
                                borderColor: lineColors ? '#' + lineColors : 'rgba(0, 0, 0, 0.8)', // Use the driver color for borderColor
                                backgroundColor: dotColors, // Use the colors array for backgroundColor
                                pointBackgroundColor: dotColors, // Use the colors array for pointBackgroundColor
                                // bigger point size
                                pointRadius: 3.5,
                                tension: 0.1
                            };
                        }).filter(dataset => dataset !== null) // Filter out null datasets
                    }}
                    height={600}
                    width={1000}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: 'positions per lap'
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Lap'
                                }
                            },
                            y: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'positions'
                                },
                                suggestedMin: 0, // Minimum value for the y-axis
                                suggestedMax: selectedDrivers.length // Maximum value for the y-axis
                            }
                        }
                    }}
                />
            )}
        </div>
    );
}

export default LapGraph;
