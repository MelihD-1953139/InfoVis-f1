import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'


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
                grid: parseInt(driver.grid),
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

    const renderGraph = () => {
        // Extract driver data
        const driverIds = Array.from(raceData.keys());
        const driverNames = driverIds.map(driverId => raceData.get(driverId).code);
        const driverData = driverIds.map(driverId => raceData.get(driverId).positions);
        const tickLabels = driverIds.map(driverId => raceData.get(driverId).positions);

        console.log(raceData)
        console.log(driverIds)
        const gridPositions = {}
        raceData.forEach((driver) => {
            gridPositions[driver.grid] = driver.name;
        })
        console.log(gridPositions[1]);
        // Find the maximum number of laps completed by any driver
        const maxLaps = Math.max(...driverData.map(driverPositions => driverPositions.length));

        // Prepare data for Chart.js
        const chartData = {
            labels: Array.from({ length: maxLaps }, (_, i) => i), // Laps
            datasets: driverIds.map((driverId, index) => ({
                label: driverNames[index],
                data: driverData[index],
                fill: false,
                labelColor: `hsl(${(index * 360) / driverIds.length}, 70%, 50%)`,
                borderColor: `hsl(${(index * 360) / driverIds.length}, 70%, 50%)`, // Different color for each driver
            })),
        };

        const chartOptions = {
            legend: {
                display: false
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: false
                    }
                },
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            return gridPositions[value];
                        },
                        stepSize: 1,
                        min: 1,
                        max: 23,
                        fontColor: function (tickValue, index) {
                            // You can define your logic here to determine the color
                            // Example: If the driver's position is less than or equal to 10, set the color to green; otherwise, set it to yellow
                            const driverId = driverIds[index];
                            const gridPosition = raceData.get(driverId).grid;
                            return gridPosition <= 10 ? 'green' : 'yellow';
                        },
                    },
                    reverse: true,
                    grid: {
                        display: false
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
