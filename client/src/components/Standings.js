import React, { useEffect, useState, useCallback } from 'react';
import Slider from '@mui/material/Slider';
import 'bootstrap/dist/css/bootstrap.css';

import { Bar } from 'react-chartjs-2';
import { useTable, usePagination, useSortBy } from 'react-table';
import {
    Switch,
    Stack,
    Typography,
    styled,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    TablePagination,
    Paper,
    IconButton,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import PaginationItem from '@mui/material/PaginationItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Pagination } from '@mui/material';

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
    const [rangeYear, setRangeYear] = useState(defaultValueSlider);
    const [driverPointsWinsDatasWinsData, setdriverPointsWinsDatasWinsData] = useState({});
    const [constructorPointsWinsData, setConstructorsPointsData] = useState({});
    const [driverChampionShipsData, setDriversChampionShipsData] = useState({});
    const [constructorChampionShipsData, setConstructorsChampionShipsData] = useState({});
    const [aggregatedData, setAggregatedData] = useState([]);

    const handleTypeStanding = (button) => {
        setTypeStanding(button);
    };
    const handleGroupStanding = (button) => {
        setGroupStanding(button);
    };
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
                            constructorChampionShipsData[year].forEach(({ constructorId, name }) => {
                                if (!aggregated[constructorId]) {
                                    aggregated[constructorId] = { data: 0, name: `${name}` };
                                }
                                aggregated[constructorId].data += 1;
                            });
                        }

                    }

                }
                else if (typeStanding === 'Wins') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (constructorPointsWinsData[year]) {
                            constructorPointsWinsData[year].forEach(({ constructorId, name, wins }) => {
                                if (!aggregated[constructorId]) {
                                    aggregated[constructorId] = { data: 0, name: `${name}` };
                                }
                                aggregated[constructorId].data += wins;
                            });
                        }

                    }
                }
                else {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (constructorPointsWinsData[year]) {
                            constructorPointsWinsData[year].forEach(({ constructorId, name, points }) => {
                                if (!aggregated[constructorId]) {
                                    aggregated[constructorId] = { data: 0, name: `${name}` };
                                }
                                aggregated[constructorId].data += points;
                            });
                        }

                    }
                }

            }
            else {
                if (typeStanding === 'Championships') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (driverChampionShipsData[year]) {
                            driverChampionShipsData[year].forEach(({ driverId, name, familyName }) => {
                                if (!aggregated[driverId]) {
                                    aggregated[driverId] = { data: 0, name: `${name} ${familyName}` };
                                }
                                aggregated[driverId].data += 1;
                            });
                        }
                    }
                }
                else if (typeStanding === 'Wins') {
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (driverPointsWinsDatasWinsData[year]) {
                            driverPointsWinsDatasWinsData[year].forEach(({ driverId, name, familyName, wins }) => {
                                if (!aggregated[driverId]) {
                                    aggregated[driverId] = { data: 0, name: `${name} ${familyName}` };
                                }
                                aggregated[driverId].data += wins;
                            });
                        }
                    }
                }
                else {
                    // Driver - Points
                    for (let year = rangeYear[0]; year <= rangeYear[1]; year++) {
                        if (driverPointsWinsDatasWinsData[year]) {
                            driverPointsWinsDatasWinsData[year].forEach(({ driverId, name, familyName, points }) => {
                                if (!aggregated[driverId]) {
                                    aggregated[driverId] = { data: 0, name: `${name} ${familyName}` };
                                }
                                aggregated[driverId].data += points;
                            });
                        }
                    }
                }
            }

            const aggregatedArray = Object.entries(aggregated).map(([id, { data, name }]) => ({
                id,
                name,
                data
            })).sort((a, b) => b.data - a.data);

            setAggregatedData(aggregatedArray);
            console.log(aggregatedArray);
        };

        console.log(driverPointsWinsDatasWinsData);
        if (Object.keys(driverPointsWinsDatasWinsData).length) {
            aggregateData();
        }
    }, [rangeYear, driverPointsWinsDatasWinsData, typeStanding, groupStanding]);

    const dataForChart = {
        labels: aggregatedData.slice(0, 15).map(item => item.name),
        datasets: [
            {
                label: `${groupStanding} ${typeStanding}`,
                data: aggregatedData.slice(0, 15).map(item => item.data),
                backgroundColor: '#1b78cf',
                borderColor: '#1b78cf',
                borderWidth: 1,
            },
        ],
    };
    const chartOptions = {
        plugins: {
            title: {
                display: false,
                text: groupStanding + ' ' + typeStanding + ' ' + rangeYear[0] + '-' + rangeYear[1]
            },
            legend: {
                display: false,
            },
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {

                ticks: {
                    color: 'black',
                    font: {
                        size: 12,
                    }
                },
                grid: {
                    display: true,
                },
                border: {
                    display: true,
                    color: 'black'
                },
                font: {
                    size: 14
                }
            },
            y: {
                ticks: {
                    color: 'black',
                    font: {
                        size: 15,
                    }
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                    color: 'black'
                }
            }
        },
    }

    const columns = React.useMemo(
        () => [
            {
                Header: groupStanding,
                accessor: 'name',
                sortType: 'alphanumeric',
                width: '50%', // Set a fixed width for the Name column
            },
            {
                Header: typeStanding,
                accessor: 'data',
                sortType: 'basic',
                width: '50%', // Set a fixed width for the Points column
            },
        ],
        [groupStanding, typeStanding]
    );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data: aggregatedData,
            initialState: { pageIndex: 0, pageSize: 10 },
        },

        useSortBy, // Add useSortBy hook
        usePagination,
    );

    return (
        <div class="h-screen">
            {/* <ReactTable
                PaginationComponent={Pagination}
                data={aggregatedData}
                columns={[
                    {
                        Header: "Name",
                        accessor: "name"
                    },
                    {
                        Header: "Points",
                        accessor: "points"
                    }
                ]}
            /> */}
            <div class='flex flex-col justify-center items-center pt-5 pb-3'>
                <div className="w-3/4">
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
                <div className="btn-group py-2" role="group" aria-label="Basic example">
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
            </div>
            <div class='flex flex-col justify-center items-center h-4/6'>
                <div class="w-4/5 h-full">
                    <Bar data={dataForChart} options={chartOptions} />
                </div>
            </div>
            <div class='flex flex-col justify-center items-center pb-5 pt-3'>
                <TableContainer component={Paper} class="w-1/3 mt-4 border border-black rounded-md">
                    <Table {...getTableProps()}>
                        <TableHead>
                            {headerGroups.map(headerGroup => (
                                <TableRow {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <TableCell
                                            {...column.getHeaderProps(column.getSortByToggleProps())}
                                            style={{ width: column.width, borderBottom: '2px solid black', fontWeight: 'bold' }}
                                        >
                                            {column.render('Header')}
                                            {/* Conditional rendering for sorting indicators */}
                                            {column.isSorted ? (column.isSortedDesc ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />) : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHead>
                        <TableBody {...getTableBodyProps()}>
                            {page.map(row => {
                                prepareRow(row);
                                return (
                                    <TableRow {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                            {page.length < 10 && (
                                <TableRow style={{ height: (10 - page.length) * 53 }}>
                                    <TableCell colSpan={columns.length} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={headerGroups[0].headers.length} style={{ borderTop: '2px solid black', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Pagination
                                            count={Math.ceil(aggregatedData.length / pageSize)}
                                            page={pageIndex + 1}
                                            onChange={(event, value) => gotoPage(value - 1)}
                                            siblingCount={1}
                                            boundaryCount={1}
                                            shape="rounded"
                                            color="primary"
                                            showFirstButton
                                            showLastButton
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </div>
        </div >
    );
};


export default Standings;
