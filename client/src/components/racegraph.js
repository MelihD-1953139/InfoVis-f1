import React, { useState, useEffect } from 'react';

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
        'http://ergast.com/api/f1/2021/1/pitstops.json?limit=2000'
    ]

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
                            default:
                                break;
                        }
                    }
                });

                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Handle errors if necessary
            });
        if (raceData) {
            console.log(raceData);
        }
    }, [selectedYear]); // Run effect whenever selectedYear changes

    const processFirstAPIData = (data) => {

        const driversMap = new Map();
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
                positions: [parseInt(driver.grid)],
                pitstops: [],
                tire: [],
            };
            driversMap.set(driverId, driverInfo);
        });

        setRaceData(driversMap);
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
                    raceData.set(driverId, driverInfo); // Update driver info in driversMap
                }
            });
        });
    };

    const processThirdAPIData = (data) => {
        data.MRData.RaceTable.Races[0].PitStops.forEach((pitstop) => {
            const driverId = pitstop.driverId;
            const pitLap = parseInt(pitstop.lap);

            // Get the driver info from driversMap
            const driverInfo = raceData.get(driverId);

            // If driverInfo exists, update its position
            if (driverInfo) {
                driverInfo.pitstops.push(pitLap); // Add position to positions array
                raceData.set(driverId, driverInfo); // Update driver info in driversMap
            }
        });
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
                <p>{data.test}</p>
            )}
        </div>
    );
}

export default Racegraph;
