import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import zoomPlugin from 'chartjs-plugin-zoom';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { compoundSymbol, symbolWithLabel } from '../util/symbolsCanvas';
// import 'bootstrap/dist/css/bootstrap.css';

ChartJS.register(zoomPlugin);
function Racegraph({ year, session, selectedDrivers }) {
    // const [selectedYear, setSelectedYear] = useState(2024);
    const [data, setData] = useState({});
    const [raceData, setRaceData] = useState(new Map());
    const [loading, setLoading] = useState(true);


    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };
    // const handleChange = (event) => {
    //     setSelectedYear(parseInt(event.target.value));
    // };
    year = '2024'
    session = '1'
    const apiEndpoints = [
        'http://ergast.com/api/f1/' + year + '/' + session + '/results.json',
        'http://ergast.com/api/f1/' + year + '/' + session + '/laps.json?limit=2000',
        'http://ergast.com/api/f1/' + year + '/' + session + '/pitstops.json?limit=2000',
        'http://localhost:8000/' + year + '/' + session + '/tires'
    ];

    useEffect(() => {
        console.log("Before API's are done");
        setLoading(true);
        const apiPromises = apiEndpoints.map(async endpoint => {
            try {
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return await response.json();
            } catch (error) {
                console.error('Error fetching data:', error);
                return null;
            }
        });

        Promise.all(apiPromises)
            .then(responses => {
                // Process each response individually
                responses.forEach((response, index) => {
                    if (response) {
                        switch (index) {
                            case 0:
                                processFirstAPIData(response);
                                break;
                            case 1:
                                processSecondAPIData(response);
                                break;
                            case 2:
                                processThirdAPIData(response);
                                break;
                            case 3:
                                processFourthAPIData(response);
                                break;
                            default:
                                break;
                        }
                    }
                });

                setLoading(false);
                console.log("After API's are done");
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Handle errors if necessary
            });
    }, [selectedDrivers]); // Run effect whenever selectedYear changes

    const processFirstAPIData = (data) => {
        data.MRData.RaceTable.Races[0].Results.forEach(driver => {
            if (true) {
                console.log("been here");
                const driverId = driver.Driver.driverId;
                const driverInfo = {
                    driverId: driver.Driver.driverId,
                    code: driver.Driver.code,
                    name: driver.Driver.givenName + ' ' + driver.Driver.familyName,
                    grid: parseInt(driver.grid),
                    laps: parseInt(driver.laps),
                    finalPosition: parseInt(driver.position),
                    status: driver.status,
                    positions: parseInt(driver.grid) !== 0 ? [parseInt(driver.grid)] : [21],
                    pitstops: [],
                    compounds: [],
                    stintlength: [],
                    color: '',
                };
                raceData.set(driverId, driverInfo);
            }
        });
    };

    const processSecondAPIData = (data) => {
        data.MRData.RaceTable.Races[0].Laps.forEach((lap) => {
            lap.Timings.forEach((timing) => {
                if (true) {
                    const driverId = timing.driverId;
                    const position = parseInt(timing.position);

                    // Get the driver info from driversMap
                    const driverInfo = raceData.get(driverId);

                    // If driverInfo exists, update its position
                    if (driverInfo) {
                        driverInfo.positions.push(position); // Add position to positions array
                        //raceData.set(driverId, driverInfo); // Update driver info in driversMap
                    }
                }

            });
        });
    };

    const processThirdAPIData = (data) => {
        data.MRData.RaceTable.Races[0].PitStops.forEach((pitstop) => {
            if (true) {

                const driverId = pitstop.driverId;
                const pitLap = parseInt(pitstop.lap);
                const driverInfo = raceData.get(driverId);

                // If driverInfo exists, update its position
                if (driverInfo) {
                    driverInfo.pitstops.push(pitLap); // Add position to positions array
                    //raceData.set(driverId, driverInfo); // Update driver info in driversMap
                }
            }
        });
    };

    const processFourthAPIData = (data) => {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const driverData = data[key];
                const driverInfo = raceData.get(key);
                if (driverInfo) {
                    driverInfo.compounds = driverData.compound;
                    driverInfo.stintlength = driverData.stintlength;
                    driverInfo.color = driverData.color;
                }

            }
        }
    };


    const softCompound = compoundSymbol('S', 'red');
    const mediumCompound = compoundSymbol('M', 'yellow');
    const hardCompound = compoundSymbol('H', 'white');
    // 'WET': 'rgba(54, 162, 235, 1)',//blue
    // 'SOFT': 'rgba(255, 99, 132, 1)', // Red
    // 'MEDIUM': 'rgba(255, 206, 86, 1)', // Yellow
    // 'HARD': 'rgb(255,255,255, 1)', // white
    // 'INTERMEDIATE': 'rgba(75, 192, 192, 1)', // Green
    // 'SUPERSOFT': 'rgba(128, 0, 128, 1)', // Purple
    const driverIdToColorMap = {};

    const driverColors = {};
    var mechanicalList = [
        "Mechanical",
        "Tyre",
        "Driver Seat",
        "Puncture",
        "Driveshaft",
        "Radiator",
        "Suspension",
        "Brakes",
        "Differential",
        "Overheating",
        "Gearbox",
        "Transmission",
        "Clutch",
        "Hydraulics",
        "Electrical",
        "Engine"
    ];

    const pointStylePerDriver = (driverId) => {
        const driverData = raceData.get(driverId);
        const statusDriver = driverData.status;
        var pointStyleDriver = Array(driverData.positions.length).fill(false);




        function compoundd(compound) {
            if (compound === 'SOFT') return softCompound;
            if (compound === 'MEDIUM') return mediumCompound;
            if (compound === 'HARD') return hardCompound;
            if (compound === 'SOFT') return softCompound;
            if (compound === 'MEDIUM') return mediumCompound;
            if (compound === 'HARD') return hardCompound;
        }

        pointStyleDriver[0] = compoundd(driverData.compounds[0]);
        const compoundsDriver = driverData.compounds.slice(1, driverData.compounds.length);


        function cumulativeSum(list) {
            let sum = 0;
            const cumulativeList = list.map((num) => sum += num);

            if (cumulativeList[cumulativeList.length - 1] >= driverData.laps) {
                cumulativeList.pop();
            }

            return cumulativeList;
        }
        const compoundPitstops = cumulativeSum(driverData.stintlength);
        const pitStops = driverData.pitstops;




        var c = 0;
        pitStops.forEach((pitStop, index) => {
            if (compoundPitstops.includes(pitStop)) {
                pointStyleDriver[pitStop] = compoundd(compoundsDriver[c]);
                c++;
            } else {
                pointStyleDriver[pitStop] = symbolWithLabel('P', driverIdToColorMap[driverId]);
            }
        });

        if (statusDriver !== 'Finished') {
            if (mechanicalList.includes(statusDriver)) {
                pointStyleDriver[pointStyleDriver.length - 1] = symbolWithLabel('M', driverIdToColorMap[driverId]);
            }
            if (statusDriver === 'Accident' || statusDriver === 'Collision') {
                pointStyleDriver[pointStyleDriver.length - 1] = symbolWithLabel('X', driverIdToColorMap[driverId]);;
            }
            if (statusDriver === 'Disqualified') {
                pointStyleDriver[pointStyleDriver.length - 1] = symbolWithLabel('D', driverIdToColorMap[driverId]);;
            }
            if (statusDriver === 'Retired') {
                pointStyleDriver[pointStyleDriver.length - 1] = symbolWithLabel('R', driverIdToColorMap[driverId]);
            }
        };
        // console.log(driverId, pointStyleDriver, driverData.status);
        return pointStyleDriver;

    };

    const renderGraph = () => {
        // const distinctColors = [
        //     '#8b008b', "#ff4500", "#ffa500", "#949416", "#8a2be2",
        //     "#dc143c", "#556b2f", "#8b4513", "#708090", "#483d8b",
        //     "#008000", "#00bfff", "#f08080", "#9acd32", "#0000ff",
        //     "#57852c", "#ff00ff", "#dda0dd", "#ff1493", "#1e90ff",
        //     "#998e2b", "#2727f5"];

        const driverIds = Array.from(raceData.keys()).sort((a, b) => {
            return raceData.get(a).grid - raceData.get(b).grid;
        });

        const driverNames = driverIds.map(driverId => raceData.get(driverId).name);
        const driverData = driverIds.map(driverId => raceData.get(driverId).positions);
        const tickLabels = driverIds.map(driverId => raceData.get(driverId).positions);


        function darkenColor(hex, amount) {
            let usePound = false;

            if (hex[0] == "#") {
                hex = hex.slice(1);
                usePound = true;
            }

            let num = parseInt(hex, 16);

            let r = (num >> 16) - amount;
            let g = (num >> 8 & 0x00FF) - amount;
            let b = (num & 0x0000FF) - amount;

            r = r < 0 ? 0 : r;
            g = g < 0 ? 0 : g;
            b = b < 0 ? 0 : b;

            return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
        }

        // Darkening amount (adjust this value as needed)
        const darkenAmount = 60;

        // Step 1: Create a mapping of driver names to colors
        const driverNameToColor = {};
        driverIds.forEach(driverId => {
            const driverInfo = raceData.get(driverId);
            if (driverInfo) {
                const darkenedColor = darkenColor(driverInfo.color, darkenAmount);
                driverNameToColor[driverInfo.name] = darkenedColor;
                driverIdToColorMap[driverId] = darkenedColor;
            }
        });

        // driverIds.forEach((driverId, index) => {
        //     driverIdToColorMap[driverId] = distinctColors[index];
        // });

        const gridPositions = {}
        raceData.forEach((driver) => {
            // if (selectedDrivers.includes(driver.name)) {
            //     gridPositions[driver.grid] = driver.name;
            // }
            gridPositions[driver.grid] = driver.name;
        })


        const maxLaps = Math.max(...driverData.map(driverPositions => driverPositions.length));
        const maxLatestPlace = Math.max(...driverIds.map(driverId => raceData.get(driverId).grid).map(gridPos => gridPos));
        console.log(maxLatestPlace)

        const chartData = {
            labels: Array.from({ length: maxLaps }, (_, i) => i), // Laps starting from -1
            datasets: driverIds.map((driverId, index) => ({
                label: driverNames[index],
                data: driverData[index],
                pointStyle: pointStylePerDriver(driverId),
                fill: false,
                borderColor: driverIdToColorMap[driverId],
                // backgroundColor: 'white',
                // hoverBackgroundColor: 'yellow',
            })),
        };

        const chartOptions = {
            plugins: {
                title: {
                    display: true,
                    text: '2021 First Grand Prix'
                },
                legend: {
                    display: false,
                },
                zoom: {
                    pan: {
                        enabled: true,
                        modifierKey: 'shift',
                        mode: 'x'
                    },
                    zoom: {
                        mode: 'x',
                        wheel: {
                            enabled: true,
                            speed: 0.07,
                        },

                        drag: {
                            enabled: true,
                            modifierKey: 'alt',
                            borderWidth: 2,
                            borderColor: 'white',
                            backgroundColor: 'rgba(128, 128, 128, 0.35)'

                        },
                        pinch: {
                            enabled: true
                        },
                    },
                    limits: {
                        y: {
                            min: 'original',
                            max: 'original',
                        },
                        x: {
                            min: 'original',
                            max: 'original'
                        }
                    },
                },

            },
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    min: -1,
                    ticks: {
                        callback: function (value, index, values) {
                            if (Number.isInteger(value) && value >= 0 && value <= maxLaps) {
                                return value;
                            } else {
                                return '';
                            }
                        },
                        stepSize: 1,
                        autoSkip: false,
                        color: 'grey'
                    },
                    grid: {
                        // offset: true,
                        display: true,
                        color: 'grey'
                    },
                    border: {
                        display: false,
                        // dashOffset: 2.0
                    }
                },
                y: {
                    min: 0,
                    max: maxLatestPlace + 1,
                    type: 'linear',
                    ticks: {
                        callback: function (value, index, values) {
                            if (value >= 1 && value <= maxLatestPlace) {
                                return gridPositions[value];;
                            } else {
                                return '';
                            }
                        },
                        color: (c) => {
                            console.log(c.tick.label);
                            console.log(driverNameToColor[c.tick.label]);
                            return driverNameToColor[c.tick.label]
                        },
                        stepSize: 1,
                        autoSkip: false,
                        // backdropPadding: 15,
                    },
                    reverse: true,
                    grid: {
                        display: true,
                        // offset: true
                    },
                    border: {
                        display: false,
                        color: 'white'
                        // dashOffset: 2.0
                    }
                }
            }
        };

        return (
            <div>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="demo-select-small-label">Age</InputLabel>
                    <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        value={age}
                        label="Age"
                        onChange={handleChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="demo-select-small-label">Age</InputLabel>
                    <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        value={age}
                        label="Age"
                        onChange={handleChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>
                <div class="flex flex-col justify-center items-center bg-white">
                    <h2>Race Positions</h2>
                    <div class="w-11/12">
                        <Line data={chartData} options={chartOptions} />
                    </div>

                </div>
            </div>


        );
    };

    return (
        <div>
            {/* <label htmlFor="yearSelect">Select a year:</label> */}
            {/* <select id="yearSelect" value={selectedYear} onChange={handleChange}>
                {Array.from({ length: 2024 - 1950 + 1 }, (_, index) => 1950 + index).map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select> */}
            {/* {loading ? (
                <p>Loading...</p>
            ) : ( */}
            {renderGraph()}
            {/* )} */}
        </div>
    );
}

export default Racegraph;