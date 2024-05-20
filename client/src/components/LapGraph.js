import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Racegraph from './racegraph.js';

Chart.register(...registerables);

function LapGraph({ year, session, selectedDrivers, drivercodes }) {
    const [Racedata, setRaceData] = useState([{}]);
    const [labels, setLabels] = useState([]);
    const [lapTimes, setLapTimes] = useState([]);
    const [tyreData, setTyreData] = useState([{}]);
    const [tyrecolors, setTyreColors] = useState([]);
    const [driverColors, setDriverColors] = useState([]);  

    useEffect(() => {
        fetchData();
        setTyreColors([]);
        getTyreData();
    }, [selectedDrivers]);

    const fetchData = () => {
        setLabels([]);
        setLapTimes([]);
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
                for (let i = 0; i < laps.length; i++) {
                    setLabels(labels => [...labels, laps[i].number]);
                    let timings = [];
                    for (let j = 0; j < laps[i].Timings.length; j++) {
                        if (selectedDrivers.includes(laps[i].Timings[j].driverId)) {
                            let time = laps[i].Timings[j].time;
                            let minutes = parseInt(time.split(":")[0]);
                            let seconds = parseFloat(time.split(":")[1]);
                            let total = minutes * 60 + seconds;
                            timings.push(total);
                        }
                    }
                    setLapTimes(lapTimes => [...lapTimes, timings]);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

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
            'WET': 'rgba(54, 162, 235, 1)',//blue
            'SOFT': 'rgba(255, 99, 132, 1)', // Red
            'MEDIUM': 'rgba(255, 206, 86, 1)', // Yellow
            'HARD': 'rgb(255,255,255, 1)', // white
            'INTERMEDIATE': 'rgba(75, 192, 192, 1)', // Green
            'SUPERSOFT': 'rgba(128, 0, 128, 1)', // Purple
            // Add more colors as needed for different tire compounds
        };

        return colorMap[tyre] || 'rgba(0, 0, 0, 0.8)'; // Default color for unknown tire compounds
    };

    const getRandomColor = () => {
        // Generate random color for the line
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    useEffect(() => {
        fetchData();
        getTyreData();
    }, []); // Fetch data when component mounts

    function calcTimeDiffMean(laptimesDriver) {
        // Calculate the difference between the mean time of selected drivers and the time of the current driver
        // for every lap...
        let means = [];
        for (let i = 0; i < lapTimes.length; i++){
            let mean = lapTimes[i].reduce((a, b) => a + b, 0) / lapTimes[i].length;
            means.push(mean);
        }

        //calculate the difference between the mean time and the time of the current driver
        for (let i = 0; i < laptimesDriver.length; i++) {
            laptimesDriver[i] = laptimesDriver[i] - means[i];
        }

        return laptimesDriver;
    }

    return (
        <div id="graphcontainer">
            {selectedDrivers.length > 0 && (
                <Line
                    data={{
                        labels: labels.map((lap) => `${lap}`),
                        datasets: selectedDrivers.map((driver, index) => {
                            driverColors.push(getRandomColor());
                            let laptimes = [];
                            let dotColors = []; // Create a separate array for dot colors
                            
                            for (let i = 0; i < lapTimes.length; i++) {
                                laptimes.push(lapTimes[i][index]);
                                if (tyrecolors[index]) {
                                    dotColors.push(tyrecolors[index][i]);
                                }
                            }
                            return {
                                label: driver,
                                data: laptimes,
                                fill: false,
                                borderColor: driverColors[index], // Use the driver color for borderColor
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
                        let lineColor = getRandomColor(); // Get random color for the line
                        let dotColors = []; // Create a separate array for dot colors
                        for (let i = 0; i < lapTimes.length; i++) {
                            laptimes.push(lapTimes[i][index]);
                            if (tyrecolors[index]) {
                                dotColors.push(tyrecolors[index][i]);
                            }
                        }
                        laptimes = calcTimeDiffMean(laptimes);
                        
                        return {
                            label: driver,
                            data: laptimes,
                            fill: false,
                            borderColor: driverColors[index], // Use the random color for borderColor
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
            <Racegraph year={year} session={session} selectedDrivers={selectedDrivers} drivercodes={drivercodes}/>
        </div>
    );
}

export default LapGraph;
