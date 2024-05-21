import React, { useEffect, useState, useCallback } from 'react';

import Slider from '@mui/material/Slider';

import 'bootstrap/dist/css/bootstrap.css';

import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from '@mui/material/styles';
// import Switch from '@mui/material/Switch';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';

const lowerBound = 1950;
const upperBound = 2024;

const defaultValueSlider = [2015, 2024];

const marks = [
    { value: lowerBound, label: lowerBound },
    { value: upperBound, label: upperBound },
];


// API CALL ANSWER TAKING TOO LONG
const fetchDriverPointsWinsStandings = async (year) => {
    const response = await fetch(`http://ergast.com/api/f1/${year}/driverStandings.json?limit=1000`);
    const data = await response.json();
    const standingsList = data.MRData.StandingsTable.StandingsLists;

    if (standingsList.length === 0) {
        return [];
    }

    return standingsList[0].DriverStandings.map(driverStanding => ({
        driverId: driverStanding.Driver.driverId,
        name: driverStanding.Driver.givenName,
        familyName: driverStanding.Driver.familyName,
        nationality: driverStanding.Driver.nationality,
        position: parseFloat(driverStanding.position),
        points: parseFloat(driverStanding.points),
        wins: parseFloat(driverStanding.wins),
    }));
};
const fetchConstructorPointsWinsStandings = async (year) => {
    const response = await fetch(`http://ergast.com/api/f1/${year}/constructorStandings.json?limit=1000`);
    const data = await response.json();

    const standingsList = data.MRData.StandingsTable.StandingsLists;

    if (standingsList.length === 0) {
        return [];
    }

    return standingsList[0].ConstructorStandings.map(constructorStanding => ({
        constructorId: constructorStanding.Constructor.constructorId,
        name: constructorStanding.Constructor.givenName,
        nationality: constructorStanding.Constructor.nationality,
        position: parseFloat(constructorStanding.position),
        points: parseFloat(constructorStanding.points),
        wins: parseFloat(constructorStanding.wins),
    }));
};
const fetchDriverChampionStandings = async () => {
    const response = await fetch('http://ergast.com/api/f1/driverStandings/1.json?limit=1000');
    const data = await response.json();

    const standingsList = data.MRData.StandingsTable.StandingsLists;

    if (standingsList.length === 0) {
        return {};
    }

    const standingsByYear = standingsList.reduce((acc, seasonStanding) => {
        const year = seasonStanding.season;
        const standingsArray = seasonStanding.DriverStandings.map(driverStanding => ({
            driverId: driverStanding.Driver.driverId,
            name: driverStanding.Driver.givenName,
            familyName: driverStanding.Driver.familyName,
            nationality: driverStanding.Driver.nationality,
            position: parseFloat(driverStanding.position),
            points: parseFloat(driverStanding.points),
            wins: parseFloat(driverStanding.wins),
        }));
        acc[year] = standingsArray;
        return acc;
    }, {});
    return standingsByYear;
};
const fetchConstructorChampionStandings = async () => {
    const response = await fetch('http://ergast.com/api/f1/constructorStandings/1.json?limit=1000');
    const data = await response.json();

    const standingsList = data.MRData.StandingsTable.StandingsLists;

    if (standingsList.length === 0) {
        return {};
    }

    const standingsByYear = standingsList.reduce((acc, seasonStanding) => {
        const year = seasonStanding.season;
        const standingsArray = seasonStanding.ConstructorStandings.map(constructorStanding => ({
            constructorId: constructorStanding.Constructor.constructorId,
            name: constructorStanding.Constructor.name,
            nationality: constructorStanding.Constructor.nationality,
            position: parseFloat(constructorStanding.position),
            points: parseFloat(constructorStanding.points),
            wins: parseFloat(constructorStanding.wins),
        }));
        acc[year] = standingsArray;
        return acc;
    }, {});
    return standingsByYear;
};

const Standings = () => {


    const [typeStanding, setTypeStanding] = useState('Points');
    const [groupStanding, setGroupStanding] = useState('Driver');

    const handleTypeStanding = (button) => {
        setTypeStanding(button);
    };
    const handleGroupStanding = (button) => {
        setGroupStanding(button);
    };


    const [rangeYear, setRangeYear] = useState(defaultValueSlider);

    const [driverPointsWinsDatasWinsData, setdriverPointsWinsDatasWinsData] = useState({});
    const [constructorPointsWinsData, setConstructorsPointsData] = useState({});

    const [driverChampionShipsData, setDriversChampionShipsData] = useState({});
    const [constructorChampionShipsData, setConstructorsChampionShipsData] = useState({});

    const [aggregatedData, setAggregatedData] = useState([]);


    const handleChange = (event, newValue) => {
        setRangeYear(newValue);
    };

    useEffect(() => {
        const fetchData = async () => {

            // 1950-2024 TAKES TOO LONG
            // const data = {};
            // for (let year = lowerBound; year <= upperBound; year++) {
            //     const standings = await fetchDataForYear(year);
            //     data[year] = standings;
            // }

            // WITHOUT API CALL (MADE API CALLS FROM 1950-2023 AND SAVED IN JSON BY MYSELF)
            const responsedriverPointsWinsData = await fetch('/driverPointsWinsStandings.json');
            const responseconstructorPointsWinsData = await fetch('/constructorPointsWinsStandings.json');

            const driverPointsWinsData = await responsedriverPointsWinsData.json();
            const constructorPointsWinsData = await responseconstructorPointsWinsData.json();

            // ONLY MAKE API CALL TO THIS YEAR BECAUSE IT MIGHT CHANGE
            driverPointsWinsData[2024] = await fetchDriverPointsWinsStandings(2024);
            constructorPointsWinsData[2024] = await fetchConstructorPointsWinsStandings(2024);

            setdriverPointsWinsDatasWinsData(driverPointsWinsData);
            setConstructorsPointsData(constructorPointsWinsData);

            // Since those 2 apis dont take long
            setDriversChampionShipsData(await fetchDriverChampionStandings());
            setConstructorsChampionShipsData(await fetchConstructorChampionStandings());


        };
        fetchData();

    }, []);

    useEffect(() => {
        const aggregateData = () => {
            const aggregated = {};
            if (groupStanding === 'Constructor') {
                if (typeStanding === 'Championships') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (constructorChampionShipsData[year]) {
                            constructorChampionShipsData[year].forEach(({ constructorId }) => {
                                if (!aggregated[constructorId]) {
                                    aggregated[constructorId] = 0;
                                }
                                aggregated[constructorId] += 1;
                            });
                        }

                    }

                }
                else if (typeStanding === 'Wins') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (constructorPointsWinsData[year]) {
                            constructorPointsWinsData[year].forEach(({ constructorId, wins }) => {
                                if (!aggregated[constructorId]) {
                                    aggregated[constructorId] = 0;
                                }
                                aggregated[constructorId] += wins;
                            });
                        }

                    }
                }
                else {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (constructorPointsWinsData[year]) {
                            constructorPointsWinsData[year].forEach(({ constructorId, points }) => {
                                if (!aggregated[constructorId]) {
                                    aggregated[constructorId] = 0;
                                }
                                aggregated[constructorId] += points;
                            });
                        }

                    }
                }

            }
            else {
                if (typeStanding === 'Championships') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (driverChampionShipsData[year]) {
                            driverChampionShipsData[year].forEach(({ driverId }) => {
                                if (!aggregated[driverId]) {
                                    aggregated[driverId] = 0;
                                }
                                aggregated[driverId] += 1;
                            });
                        }
                    }
                }
                else if (typeStanding === 'Wins') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (driverPointsWinsDatasWinsData[year]) {
                            driverPointsWinsDatasWinsData[year].forEach(({ driverId, wins }) => {
                                if (!aggregated[driverId]) {
                                    aggregated[driverId] = 0;
                                }
                                aggregated[driverId] += wins;
                            });
                        }
                    }
                }
                else {
                    // Driver - Points
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (driverPointsWinsDatasWinsData[year]) {
                            driverPointsWinsDatasWinsData[year].forEach(({ driverId, points }) => {
                                if (!aggregated[driverId]) {
                                    aggregated[driverId] = 0;
                                }
                                aggregated[driverId] += points;
                            });
                        }
                    }
                }
            }


            const aggregatedArray = Object.entries(aggregated).map(([name, points]) => ({ name, points }));
            aggregatedArray.sort((a, b) => b.points - a.points);

            setAggregatedData(aggregatedArray);
        };

        console.log(driverPointsWinsDatasWinsData);
        if (Object.keys(driverPointsWinsDatasWinsData).length) {
            aggregateData();
        }
    }, [rangeYear, driverPointsWinsDatasWinsData, typeStanding, groupStanding]);


    return (
        <div class='flex flex-col justify-center items-center bg-white'>

            <div className=" w-3/4">
                <Slider class=""
                    aria-label="Custom marks"
                    value={rangeYear}
                    onChange={handleChange}
                    valueLabelDisplay="on"
                    step={1}
                    marks={marks}
                    min={1950}
                    max={2024}
                />

            </div>
            <div className="btn-group" role="group" aria-label="Basic example">
                <button
                    type="button"
                    className={'Driver' === groupStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                    onClick={() => handleGroupStanding('Driver')}
                >
                    Driver
                </button>
                <button
                    type="button"
                    className={'Constructor' === groupStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                    onClick={() => handleGroupStanding('Constructor')}
                >
                    Constructor
                </button>
            </div>
            <div className="btn-group py-3" role="group" aria-label="Basic example">
                <button
                    type="button"
                    className={'Points' === typeStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                    onClick={() => handleTypeStanding('Points')}
                >
                    Points
                </button>
                <button
                    type="button"
                    className={'Wins' === typeStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                    onClick={() => handleTypeStanding('Wins')}
                >
                    Wins
                </button>
                <button
                    type="button"
                    className={'Championships' === typeStanding ? 'btn btn-dark' : 'btn btn-outline-dark'}
                    onClick={() => handleTypeStanding('Championships')}
                >
                    Championships
                </button>
            </div>
            <h2> {groupStanding} {typeStanding} {rangeYear[0]} - {rangeYear[1]}</h2>
            <ul>
                {/* Render aggregated data based on current mode */}
                {aggregatedData.map(({ name, points }) => (
                    <li key={name}>{name}: {points} {typeStanding}</li>
                ))}
            </ul>
        </div>

    );
};

export default Standings;
