import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'


import { compoundSymbol, symbolWithLabel } from '../util/symbolsCanvas';
import tire from './s.jpg';

function Racegraph() {
    const [selectedYear, setSelectedYear] = useState(2024);
    const [data, setData] = useState({});
    const [raceData, setRaceData] = useState(new Map());
    const [loading, setLoading] = useState(true);

    const handleChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    };

    const apiEndpoints = [
        'http://ergast.com/api/f1/2021/1/results.json',
        'http://ergast.com/api/f1/2021/1/laps.json?limit=2000',
        'http://ergast.com/api/f1/2021/1/pitstops.json?limit=2000',
        '/2021/1/tires'
    ];

    useEffect(() => {
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
                console.log(raceData);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Handle errors if necessary
            });
    }, [selectedYear]); // Run effect whenever selectedYear changes

    const processFirstAPIData = (data) => {
        data.MRData.RaceTable.Races[0].Results.forEach(driver => {
            const driverId = driver.Driver.driverId;
            const driverInfo = {
                driverId: driver.Driver.driverId,
                code: driver.Driver.code,
                name: driver.Driver.givenName + ' ' + driver.Driver.familyName,
                grid: parseInt(driver.grid) !== 0 ? parseInt(driver.grid) : 21,
                laps: parseInt(driver.laps),
                finalPosition: parseInt(driver.position),
                status: driver.status,
                positions: parseInt(driver.grid) !== 0 ? [parseInt(driver.grid)] : [21],
                pitstops: [],
                compounds: [],
                stintlength: [],
            };
            raceData.set(driverId, driverInfo);
        });
    };

    const processSecondAPIData = (data) => {
        data.MRData.RaceTable.Races[0].Laps.forEach((lap) => {
            lap.Timings.forEach((timing) => {
                const driverId = timing.driverId;
                const position = parseInt(timing.position);

                // Get the driver info from driversMap
                const driverInfo = raceData.get(driverId);

                // If driverInfo exists, update its position
                if (driverInfo) {
                    driverInfo.positions.push(position); // Add position to positions array
                    //raceData.set(driverId, driverInfo); // Update driver info in driversMap
                }
            });
        });
    };

    const processThirdAPIData = (data) => {
        data.MRData.RaceTable.Races[0].PitStops.forEach((pitstop) => {
            const driverId = pitstop.driverId;
            const pitLap = parseInt(pitstop.lap);
            const driverInfo = raceData.get(driverId);

            // If driverInfo exists, update its position
            if (driverInfo) {
                driverInfo.pitstops.push(pitLap); // Add position to positions array
                //raceData.set(driverId, driverInfo); // Update driver info in driversMap
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
                }

            }
        }
    };



    const mechanicalSymbol = symbolWithLabel('M', 'white');
    const dnfSymbol = symbolWithLabel('D', 'white');
    const accidentSybmol = symbolWithLabel('X', 'white');
    const retiredSymbol = symbolWithLabel('R', 'white');

    const softCompound = compoundSymbol('S', 'red');
    const mediumCompound = compoundSymbol('M', 'yellow');
    const hardCompound = compoundSymbol('H', 'white');

    const driverIdToColorMap = {};

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

        pointStyleDriver[0] = driverData.compounds[0];
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


        function compoundd(compound) {
            if (compound === 'SOFT') return softCompound;
            if (compound === 'MEDIUM') return mediumCompound;
            if (compound === 'HARD') return hardCompound;
        }

        var c = 0;
        pitStops.forEach((pitStop, index) => {
            if (compoundPitstops.includes(pitStop)) {
                pointStyleDriver[pitStop] = compoundd(compoundsDriver[c]);
                c++;
            } else {
                pointStyleDriver[pitStop] = symbolWithLabel('P', driverIdToColorMap[driverId]);
            }
        });
        console.log(driverId, pointStyleDriver, driverData.status);
        return pointStyleDriver;



    };
    let imagesLoaded = 0;
    function createChart() {
        imagesLoaded++;
    }
    const renderGraph = () => {
        // Extract driver data


        const distinctColors = [
            '#8b008b', "#ff4500", "#ffa500", "#949416", "#8a2be2",
            "#dc143c", "#556b2f", "#8b4513", "#708090", "#483d8b",
            "#008000", "#00bfff", "#f08080", "#9acd32", "#0000ff",
            "#57852c", "#ff00ff", "#dda0dd", "#ff1493", "#1e90ff",
            "#998e2b", "#2727f5"];
        var driverIds = Array.from(raceData.keys());
        const sortedDriverIds = Array.from(raceData.keys()).sort((a, b) => {
            return raceData.get(a).grid - raceData.get(b).grid;
        });
        driverIds = sortedDriverIds
        console.log(sortedDriverIds);

        const driverNames = sortedDriverIds.map(driverId => raceData.get(driverId).code);
        const driverData = sortedDriverIds.map(driverId => raceData.get(driverId).positions);
        const tickLabels = sortedDriverIds.map(driverId => raceData.get(driverId).positions);


        sortedDriverIds.forEach((driverId, index) => {
            driverIdToColorMap[driverId] = distinctColors[index];
        });
        console.log(driverIdToColorMap)



        console.log(raceData)
        console.log(driverIds.length)
        const gridPositions = {}
        raceData.forEach((driver) => {
            gridPositions[driver.grid] = driver.name;
        })
        console.log(gridPositions[1]);
        // Find the maximum number of laps completed by any driver
        const maxLaps = Math.max(...driverData.map(driverPositions => driverPositions.length));





        console.log(driverNames);

        const mechanicalSymbol = symbolWithLabel('M', 'white');
        const dnfSymbol = symbolWithLabel('D', 'white');
        const accidentSybmol = symbolWithLabel('X', 'white');




        const chartData = {
            labels: Array.from({ length: maxLaps }, (_, i) => i), // Laps starting from -1
            datasets: driverIds.map((driverId, index) => ({
                label: driverNames[index],
                data: driverData[index],
                pointStyle: pointStylePerDriver(driverId),
                fill: false,
                labelColor: driverIdToColorMap[driverId],
                borderColor: driverIdToColorMap[driverId], // Different color for each driver
            })),
        };

        const chartOptions = {
            plugins: {
                legend: {
                    display: true
                },
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Custom Chart Title'
                }
            },
            borderWidth: 4,
            layout: {
                padding: {
                    left: 20, // Adjust as needed
                    right: 20, // Adjust as needed
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        color: 'black',
                        stepSize: 1,
                        callback: function (value, index, values) {
                            if (value === -1 || value === maxLaps) { // Adjust to handle maxLaps
                                return '';
                            } else {
                                return value;
                            }
                        }
                    },
                    grid: {
                        offset: true,
                        tickLength: 10
                    },
                    border: {
                        display: true,
                        dashOffset: 2.0
                    }
                },
                y: {
                    grid: {
                        offset: false
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            return gridPositions[value];
                        },
                        color: distinctColors.slice(0, driverIds.length).reverse(),
                        stepSize: 1,
                        fontColor: function (tickValue, index) {
                            const driverId = driverIds[index];
                            const gridPosition = raceData.get(driverId).grid;
                            return 'yellow';
                        },
                    },
                    reverse: true,
                    grid: {
                        display: false
                    },
                    border: {
                        display: false,
                        dashOffset: 2.0
                    }
                }
            }
        };




        return (
            <div>
                <h2>Race Positions</h2>
                <Line data={chartData} options={chartOptions} />
            </div>
        );
    };

    return (
        <div>
            {/* <img src={tire} alt={"logo"} /> */}
            <label htmlFor="yearSelect">Select a year:</label>
            <select id="yearSelect" value={selectedYear} onChange={handleChange}>
                {Array.from({ length: 2024 - 1950 + 1 }, (_, index) => 1950 + index).map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
            {loading ? (
                <p>Loading...</p>
            ) : (
                renderGraph()
            )}
        </div>
    );
}

export default Racegraph;