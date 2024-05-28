import fetch from 'node-fetch';
import fs from 'fs/promises';

const fetchDataForYear = async (year) => {
    const response = await fetch(`http://ergast.com/api/f1/${year}/constructorStandings.json?limit=1000`);
    const data = await response.json();

    const standingsList = data.MRData.StandingsTable.StandingsLists;

    if (standingsList.length === 0) {
        return [];
    }

    return standingsList[0].ConstructorStandings.map(constructorStanding => ({
        constructorId: constructorStanding.Constructor.constructorId,
        name: constructorStanding.Constructor.name,
        nationality: constructorStanding.Constructor.nationality,
        position: parseFloat(constructorStanding.position),
        points: parseFloat(constructorStanding.points),
        wins: parseFloat(constructorStanding.wins),
    }));
};

const fetchAndSaveData = async () => {
    const data = {};
    for (let year = 1950; year <= 2023; year++) {
        console.log(`Fetching data for year: ${year}`);
        const standings = await fetchDataForYear(year);
        data[year] = standings;
    }
    await fs.writeFile('public/constructorPointsWinsStanding.json', JSON.stringify(data, null, 2));
    console.log('Data saved to public/constructorStandings.json');
};

fetchAndSaveData();
