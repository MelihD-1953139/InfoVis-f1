import React, { useEffect, useState, useCallback } from 'react';

import Slider from '@mui/material/Slider';


import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";



const lowerBound = 1950;
const upperBound = 2024;

const defaultValueSlider = [2015, 2024];

const marks = [
    { value: lowerBound, label: lowerBound },
    { value: upperBound, label: upperBound },
];


// API CALL ANSWER TAKING TOO LONG
const fetchDataForYear = async (year) => {
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



const Standings = () => {
    const [value, setValue] = useState(defaultValueSlider);
    const [yearlyData, setYearlyData] = useState({});
    const [aggregatedData, setAggregatedData] = useState([]);
    const [mode, setMode] = useState('driver'); // State to track current mode (driver or constructor)


    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(previouslyCollapsed => {
            return !previouslyCollapsed;
        });
    }, []);




    const toggleMode = () => {
        setMode(prevMode => (prevMode === 'driver' ? 'constructor' : 'driver')); // Toggle mode between driver and constructor
    };
    const handleChange = (event, newValue) => {
        setValue(newValue);
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
            const response = await fetch('/driverPointStandings.json');
            const data = await response.json();

            // ONLY MAKE API CALL TO THIS YEAR BECAUSE IT MIGHT CHANGE
            data[2024] = await fetchDataForYear(2024);

            setYearlyData(data);
        };
        fetchData();

    }, []);

    useEffect(() => {
        const aggregateData = () => {
            const aggregated = {};
            for (let year = value[0]; year <= value[1]; year++) {
                if (yearlyData[year]) {
                    yearlyData[year].forEach(({ driverId, points }) => {
                        if (!aggregated[driverId]) {
                            aggregated[driverId] = 0;
                        }
                        aggregated[driverId] += points;
                    });
                }
            }

            const aggregatedArray = Object.entries(aggregated).map(([name, points]) => ({ name, points }));
            aggregatedArray.sort((a, b) => b.points - a.points);

            setAggregatedData(aggregatedArray);
        };

        console.log(yearlyData);
        if (Object.keys(yearlyData).length) {
            aggregateData();
        }
    }, [value, yearlyData]);


    return (
        <div class='flex flex-col justify-center items-center bg-white'>
            <div className=" w-3/4 py-14">
                <Slider class=""
                    aria-label="Custom marks"
                    value={value}
                    onChange={handleChange}
                    valueLabelDisplay="on"
                    step={1}
                    marks={marks}
                    min={1950}
                    max={2024}
                />

            </div>
            <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                <Typography>
                    Off
                </Typography>
                <Switch onChange={toggleCollapsed} value={collapsed} sx={{
                    "&.MuiSwitch-root .MuiSwitch-switchBase": {
                        color: "red"
                    },

                    "&.MuiSwitch-root .Mui-checked": {
                        color: "red"
                    }
                }} />
                <Switch onChange={toggleCollapsed} value={collapsed} color='secondary' />
                <Typography>
                    On
                </Typography>
            </Stack>
            <h2>Aggregated {mode === 'driver' ? 'Driver' : 'Constructor'} Standings: {value[0]} - {value[1]}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span>Driver</span>
                <label className="switch">
                    <input type="checkbox" onChange={toggleMode} checked={mode === 'constructor'} />
                    <span className="slider round"></span>
                </label>
                <span>Constructor</span>
            </div>
            <ul>
                {/* Render aggregated data based on current mode */}
                {aggregatedData.map(({ name, points }) => (
                    <li key={name}>{name}: {points} points</li>
                ))}
            </ul>
        </div>

    );
};

export default Standings;
