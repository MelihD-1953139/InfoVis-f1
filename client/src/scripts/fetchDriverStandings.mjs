import fetch from 'node-fetch';
import fs from 'fs/promises';

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

const fetchAndSaveData = async () => {
    const data = {};
    for (let year = 1950; year <= 2023; year++) {
        console.log(`Fetching data for year: ${year}`);
        const standings = await fetchDataForYear(year);
        data[year] = standings;
    }
    await fs.writeFile('public/driverPointsWinsStanding.json', JSON.stringify(data, null, 2));
    console.log('Data saved to public/driverPointStandings.json');
};

fetchAndSaveData();
