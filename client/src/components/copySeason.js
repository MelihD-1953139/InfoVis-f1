import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { CircularProgress } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { compoundSymbol } from '../util/symbolsCanvas'; // Ensure this import is correct
import { Chart as ChartJS } from 'chart.js/auto'
import zoomPlugin from 'chartjs-plugin-zoom';
ChartJS.register(zoomPlugin);


const lowestYear = 1950;
const highestYear = 2024;

const fetchSessions = async (year) => {
    const response = await fetch(`http://ergast.com/api/f1/${year}.json?limit=1000`);
    const data = await response.json();

    const races = data.MRData.RaceTable.Races;

    return races.map(race => ({
        round: race.round,
        raceName: race.raceName,
    }));
};

const fetchRaceResults = async (year, round) => {
    const response = await fetch(`http://ergast.com/api/f1/${year}/${round}/results.json?limit=1000`);
    const data = await response.json();

    const race = data.MRData.RaceTable.Races[0];

    return race.Results.map(result => ({
        position: result.position,
        points: parseFloat(result.points),
        driverName: `${result.Driver.givenName} ${result.Driver.familyName}`,
        constructorName: result.Constructor.name,
    }));
};

const Season = () => {
    const [availableYear, setAvailableYear] = useState(2022);
    const [sessions, setSessions] = useState([]);
    const [raceResults, setRaceResults] = useState({});
    const [cumulativePoints, setCumulativePoints] = useState({});
    const [loading, setLoading] = useState(false);
    const [driverColors, setDriverColors] = useState({});
    const [groupStanding, setGroupStanding] = useState('Driver');

    const availableYears = [];
    for (let i = lowestYear; i <= highestYear; i++) {
        availableYears.push(i);
    }



    const handleGroupStanding = (button) => {
        setGroupStanding(button);
    };


    const handleChangeAvailableYear = async (event) => {
        const year = event.target.value;
        setAvailableYear(year);
        setLoading(true);
        const fetchedSessions = await fetchSessions(year);
        setSessions(fetchedSessions);
        await fetchAllRaceResults(year, fetchedSessions);
        setLoading(false);
    };


    const fetchColorsDriver = async (year, fetchedSessions) => {
        const response = await fetch(`http://localhost:8000/${year}/${fetchedSessions.length}/driverscolor`);
        const data = await response.json();
        setDriverColors(data);
    };

    const fetchAllRaceResults = async (year, sessions) => {
        const results = {};
        for (const session of sessions) {
            const raceResults = await fetchRaceResults(year, session.round);
            results[session.round] = raceResults;
        }
        setRaceResults(results);
        calculateCumulativePoints(results, sessions);
    };

    const calculateCumulativePoints = (results, sessions) => {
        const cumulativePoints = {};
        sessions.forEach((session, roundIndex) => {
            const round = session.round;
            results[round]?.forEach(result => {
                const driver = result.driverName;
                if (!cumulativePoints[driver]) {
                    cumulativePoints[driver] = {
                        points: Array(sessions.length).fill(0),
                        positions: Array(sessions.length).fill(null),
                    };
                }
                if (roundIndex > 0) {
                    cumulativePoints[driver].points[roundIndex] = cumulativePoints[driver].points[roundIndex - 1] + result.points;
                } else {
                    cumulativePoints[driver].points[roundIndex] = result.points;
                }
                cumulativePoints[driver].positions[roundIndex] = result.position;
            });
        });
        setCumulativePoints(cumulativePoints);
    };

    const initializeSessions = async () => {
        setLoading(true);
        const fetchedSessions = await fetchSessions(availableYear);
        setSessions(fetchedSessions);
        await fetchAllRaceResults(availableYear, fetchedSessions);
        await fetchColorsDriver(availableYear, fetchedSessions);
        setLoading(false);
    };

    useEffect(() => {
        initializeSessions();
    }, [availableYear]);

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 200, // Set the max height you want for the dropdown
            },
        },
    };

    const getLineChartData = () => {
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



        const labels = sessions.map(session => session.raceName);
        const winSymbol = compoundSymbol('W', 'green'); // First place symbol
        const firstPlaceSymbol = compoundSymbol('1', 'gold'); // First place symbol
        const secondPlaceSymbol = compoundSymbol('2', 'silver'); // Second place symbol
        const thirdPlaceSymbol = compoundSymbol('3', 'bronze'); // Third place symbol

        const datasets = Object.keys(cumulativePoints).map(driver => {
            const driverData = cumulativePoints[driver];
            const pointStyleDriver = Array(driverData.points.length).fill(false);

            driverData.positions.forEach((position, index) => {
                if (position === "1") {
                    pointStyleDriver[index] = winSymbol;
                }
            });

            // Determine top 3 drivers in the last race
            if (sessions.length > 0) {
                const lastRaceIndex = sessions.length - 1;
                const driverPointsInLastRace = Object.keys(cumulativePoints).map(driver => ({
                    driver,
                    points: cumulativePoints[driver].points[lastRaceIndex],
                }));

                driverPointsInLastRace.sort((a, b) => b.points - a.points);

                if (driverPointsInLastRace[0] && driverPointsInLastRace[0].driver === driver) {
                    pointStyleDriver[lastRaceIndex] = firstPlaceSymbol;
                }
                if (driverPointsInLastRace[1] && driverPointsInLastRace[1].driver === driver) {
                    pointStyleDriver[lastRaceIndex] = secondPlaceSymbol;
                }
                if (driverPointsInLastRace[2] && driverPointsInLastRace[2].driver === driver) {
                    pointStyleDriver[lastRaceIndex] = thirdPlaceSymbol;
                }
            }
            // Darkening amount (adjust this value as needed)
            const darkenAmount = 40;
            var bColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
            if (driverColors[driver]) {
                bColor = darkenColor('#' + driverColors[driver], darkenAmount);
            }

            return {
                label: driver,
                data: driverData.points,
                fill: false,
                borderColor: bColor,
                pointStyle: pointStyleDriver, // Assign pointStyle to dataset
            };
        });
        return { labels, datasets };
    };

    const chartOptions = {
        plugins: {
            title: {
                display: false,
            },
            legend: {
                display: true,
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => {
                        const driverName = tooltipItems[0].dataset.label;
                        const raceIndex = tooltipItems[0].dataIndex;
                        const grandPrix = tooltipItems[0].label;
                        const pointsCumilative = tooltipItems[0].dataset.data;
                        let result = raceResults[raceIndex + 1].find(driver => driver.driverName === driverName);
                        return `${grandPrix}\n${driverName} (${result.constructorName})\nPoints: ${pointsCumilative[raceIndex]}\nP${result.position}, +${result.points}`;
                    },
                    label: (tooltipItem) => {
                        return ''
                    },
                },
            },
            zoom: {
                pan: {
                    enabled: true,
                    modifierKey: 'shift',
                    mode: 'xy'
                },
                zoom: {
                    mode: 'xy',
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
        maintainAspectRatio: false,
        scales: {
            x: {
                offset: true,
                ticks: {
                    callback: function (value, index, values) {
                        if (Number.isInteger(value) && value >= 0 && value <= sessions.length) {
                            let raceName = sessions[index]?.raceName ?? value;
                            return raceName.replace(/Grand Prix/i, '').trim();
                        } else {
                            return '';
                        }
                    },


                    stepSize: 1,
                    autoSkip: false,
                    color: 'black'
                },
                grid: {
                    // offset: true,
                    display: true,
                },
                border: {
                    display: true,
                    // dashOffset: 2.0
                }
            },
            y: {
                min: -1,
                ticks: {
                    callback: function (value, index, values) {
                        if (Number.isInteger(value) && value >= 0) {
                            return value;
                        } else {
                            return '';
                        }
                    },
                    // stepSize: 1,
                    // autoSkip: false,
                    // color: 'grey'
                    color: 'black'
                },
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
        <div className="h-screen">
            <div className="flex justify-center items-center pt-2">
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="available-year-select-label">Year</InputLabel>
                    <Select
                        labelId="available-year-select-label"
                        id="available-year-select"
                        value={availableYear}
                        label="Year"
                        onChange={handleChangeAvailableYear}
                        MenuProps={MenuProps}
                    >
                        {availableYears.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div className="flex justify-center items-center p-1">
                <div className="btn-group" role="group" aria-label="Basic example">
                    <button
                        type="button"
                        className={'Driver' === groupStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                        onClick={() => handleGroupStanding('Driver')}
                    >
                        Drivers
                    </button>
                    <button
                        type="button"
                        className={'Constructor' === groupStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                        onClick={() => handleGroupStanding('Constructor')}
                    >
                        Constructors
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <CircularProgress color="inherit" size={70} />
                </div>
            ) : (
                <>
                    <div className='flex justify-center items-center h-5/6 pt-2'>
                        <div className='h-full w-11/12'>
                            <Line data={getLineChartData()} options={chartOptions} />
                        </div>
                    </div>

                    {/* <div>
                        {sessions.map((session) => (
                            <div key={session.round}>
                                <h3>{session.raceName}</h3>
                                <ul>
                                    {raceResults[session.round]?.map((result, index) => (
                                        <li key={index}>
                                            {result.position}: {result.driverName} ({result.constructorName}) - {result.points} points
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div> */}

                </>
            )}
            <div className='flex justify-center items-center bg-white p-5'>
                <p class='text-black'>Made by Melih</p>
            </div>
        </div>
    );
};

export default Season;
