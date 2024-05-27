import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import zoomPlugin from 'chartjs-plugin-zoom';
import Box from '@mui/material/Box';
import { CircularProgress } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { compoundSymbol, symbolWithLabel } from '../util/symbolsCanvas';

const lowestYear = 1950;
const highestYear = 2024;

const Season = () => {

    const [availableYear, setAvailableYear] = useState(2022);

    const availableYears = [];
    for (let i = lowestYear; i <= highestYear; i++) {
        availableYears.push(i);
    }


    const handleChangeAvailableYear = async (event) => {
        const year = event.target.value;
        setAvailableYear(year);
        // const fetchedSessions = await fetchSessions(year);
        // setSessions(fetchedSessions);
        // if (fetchedSessions.length > 0) {
        //     setSelectedSession(fetchedSessions[0].session); // Select the first session by default
        // } else {
        //     setSelectedSession(''); // Clear selected session if no sessions are available
        // }
    };


    return (
        <div class='h-screen'>
            <div class='flex justify-center items-center pt-2'>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="available-year-select-label">Year</InputLabel>
                    <Select
                        labelId="available-year-select-label"
                        id="available-year-select"
                        value={availableYear}
                        label="Year"
                        onChange={handleChangeAvailableYear}
                    >
                        {availableYears.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </div>
            Melih
        </div>
    )
}

export default Season;