import { useEffect, useState } from "react";
import "./qualifying.css";
import { Line } from "react-chartjs-2";



function QualiView({SelectedDrivers, DriverCodes, year, circuitId, session, setFastsestLaps, DriverColors}) {

    const [circuit, setCircuit] = useState("/assets/f1_2020/australia.svg");
    const [qualiData, setQualiData] = useState([]);
    const [Qualispeed, setQualispeed] = useState([{}]);
    const [driverColors, setDriverColors] = useState({});


    function loadCircuit(circuit_id){
        let url = "";
    
        switch (circuit_id) {
            case "albert_park":
                url += "/assets/f1_2020/australia.svg";
                break;
            case "americas":
                url += "/assets/f1_2020/usa.svg";
                break;
            case "bahrain":
                url += "/assets/f1_2020/bahrain.svg";
                break;
            case "baku":
                url += "/assets/f1_2020/azerbaijan.svg";
                break;
            case "catalunya":
                url += "/assets/f1_2020/spain.svg";
                break;
            case "hungaroring":
                url += "/assets/f1_2020/hungary.svg";
                break;
            case "interlagos":
                url += "/assets/f1_2020/brazil.svg";
                break;
            case "marina_bay":
                url += "/assets/f1_2020/singapore.svg";
                break;
            case "monaco":
                url += "/assets/f1_2020/monaco.svg";
                break;
            case "monza":
                url += "/assets/f1_2020/italy.svg";
                break;
            case "red_bull_ring":
                url += "/assets/f1_2020/austria.svg";
                break;
            case "rodriguez":
                url += "/assets/f1_2020/mexico.svg";
                break;
            case "shanghai":
                url += "/assets/f1_2020/china.svg";
                break;
            case "silverstone":
                url += "/assets/f1_2020/greatbritain.svg";
                break;
            case "sochi":
                url += "/assets/f1_2020/russia.svg";
                break;
            case "spa":
                url += "/assets/f1_2020/belgium.svg";
                break;
            case "suzuka":
                url += "/assets/f1_2020/japan.svg";
                break;
            case "villeneuve":
                url += "/assets/f1_2020/canada.svg";
                break;
            case "yas_marina":
                url += "/assets/f1_2020/abudhabi.svg";
                break;
            case "zandvoort":
                url += "/assets/f1_2020/netherlands.svg";
                break;
            default:
                url += "/assets/f1_2020/australia.svg";
        }
    
        setCircuit(url);
    }

    function minuteStringToMillis(str){
        let minutes = parseInt(str.substring(0, 1));
        let seconds = parseInt(str.substring(2, 4));
        let millis = parseInt(str.substring(5, 8));
        return (minutes * 60000) + (seconds * 1000) + millis;
    }

    function millisToMinuteString(millis){
        if (millis === "") {
            return millis;
        }
        let minutes = Math.floor(millis / 60000);
        let seconds = Math.floor((millis % 60000) / 1000);
        let millis2 = millis % 1000;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return `${minutes}:${seconds}.${millis2}`;
    }

    function loadQualiSpeed() {
        if (DriverCodes.length === 0) {
            return;
        }
        fetch(`http://localhost:8000/qualifyingspeed?year=${year}&round=${session}&drivers=${DriverCodes.join(",")}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setQualispeed(data);
                
                fillGrid();
            });
    }

    useEffect(() => {
        fillGrid();
        loadQualiSpeed();
    }, [qualiData, DriverCodes]);

    function loadQualiSession(){
        if (year === 1996 || session === 1) {
            return;
        }
        fetch(`http://localhost:8000/qualifying?year=${year}&round=${session}`)
            .then((res) => res.json())
            .then((data) => {
                fetch(`https://ergast.com/api/f1/${year}/${session}/qualifying.json?limit=1000`)
                    .then((res) => res.json())
                    .then((data2) => {
                        console.log(data, data2);
                        let driversdata = [];
                        let drivercode = "";
                        let fastestlap = null;
                        let qualitimes = [];
                        let sectortimes = [];
                        let compound = "";
                        let all_times = [];
                        let i = 0;
                        while(true){
                            if (!data["Driver"][i]){
                                break;
                            } else {
                                let newdrivercode = data["Driver"][i];
                                if (newdrivercode === drivercode) {
                                    if (data.LapTime[i] !== null){
                                        all_times.push(data.LapTime[i]);
                                    }
                                    if (fastestlap === null || (data["LapTime"][i] !== null && data["LapTime"][i] < fastestlap)) {
                                        fastestlap = data["LapTime"][i];
                                        sectortimes = [];
                                        sectortimes.push(data["Sector1Time"][i]);
                                        sectortimes.push(data["Sector2Time"][i]);
                                        sectortimes.push(data["Sector3Time"][i]);
                                        compound = data["Compound"][i];
                                    }
                                } else {
                                    if (drivercode !== "") {
                                    let driverdata = {
                                            driver: drivercode,
                                            compound: compound,
                                            fastestlap: fastestlap,
                                            sectortimes: sectortimes,
                                            all_times: all_times,
                                            qualitimes: qualitimes
                                    };
                                        driversdata.push(driverdata);
                                        all_times = [];
                                        sectortimes = [];
                                        qualitimes = [];
                                    }
                                    drivercode = newdrivercode;

                                    compound = data["Compound"][i];
                                    fastestlap = data["LapTime"][i];
                                    let drivertimes = data2.MRData.RaceTable.Races[0].QualifyingResults;
                                    drivertimes.forEach((driver) => {
                                        if (driver.Driver.code === drivercode) {
                                            try {
                                                qualitimes.push(minuteStringToMillis(driver.Q1));
                                                qualitimes.push(minuteStringToMillis(driver.Q2));
                                                qualitimes.push(minuteStringToMillis(driver.Q3));
                                            } catch (error) {
                                                while (qualitimes.length < 3) {
                                                    qualitimes.push("");
                                                }
                                            }
                                        }
                                    });
                                    sectortimes.push(data["Sector1Time"][i]);
                                    sectortimes.push(data["Sector2Time"][i]);
                                    sectortimes.push(data["Sector3Time"][i]);
                                    if (data.LapTime[i] !== null){
                                        all_times.push(data.LapTime[i]);
                                    }
                                }
                            }
                            i++;
                        }
                        console.log("driversdata");
                        console.log(driversdata);
                        setQualiData(driversdata);
                    });
                
            });
    
    }

    useEffect(() => {
        fillGrid();
    }, [qualiData, DriverCodes]);

    function fillGrid(){
        console.log(qualiData);
        const grid = document.querySelector('.qualifying-grid');

        // fill in header
        grid.innerHTML = `
            <div class="cell driver-cell">Driver</div>
            <div class="q-session cell">Q1</div>
            <div class="q-session cell">Q2</div>
            <div class="q-session cell">Q3</div>
        `;



        qualiData.forEach(driver => {
            console.log("in driver");
                if (DriverCodes.includes(driver.driver)) {
                    console.log("driver");
                    console.log(driver);
                    const driverNameCell = `<div class="cell driver-cell">${driver.driver}</div>`;
                    
                    let q1 = {};
                    let q2 = {};
                    let q3 = {};

                    
                    
                    if (driver.qualitimes.length > 0) {
                        q1 = { time: driver.qualitimes[0], tyres: "", sectorTimes: ["", "", ""] }
                        if (driver.qualitimes.length > 1) {
                            q2 = {time: driver.qualitimes[1], tyres: "", sectorTimes: ["", "", ""]}
                            if (driver.qualitimes.length > 2) {
                                q3 = {time: driver.qualitimes[2], tyres: "", sectorTimes: ["", "", ""]}
                            } else {
                                q3 = {time: "", tyres: "", sectorTimes: ["", "", ""]};
                            }
                        } else {
                            q2 = {time: "", tyres: "", sectorTimes: ["", "", ""]};
                            q3 = {time: "", tyres: "", sectorTimes: ["", "", ""]};
                        }
                    } else {
                        q1 = {time: "", tyres: "", sectorTimes: ["", "", ""]};
                        q2 = {time: "", tyres: "", sectorTimes: ["", "", ""]};
                        q3 = {time: "", tyres: "", sectorTimes: ["", "", ""]};
                    }

                    if (driver.compound !== "") {
                        q1.tyres = driver.compound;
                        q2.tyres = driver.compound;
                        q3.tyres = driver.compound;
                    }

                    if (driver.sectortimes.length > 0) {
                        q1.sectorTimes = driver.sectortimes.slice(0, 3);
                    }



                    
                    let q1class = "sector-yellow";
                    let q1sector1class = ["sector-yellow", "sector-yellow", "sector-yellow"];
                    let q2class = "sector-yellow";
                    let q2sector1class = ["sector-yellow", "sector-yellow", "sector-yellow"];
                    let q3class = "sector-yellow";
                    let q3sector1class = ["sector-yellow", "sector-yellow", "sector-yellow"];

                    if (q1.time !== "") {
                        // if the time is slowest of all in the session, red
                        if (q1.time === Math.max(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.qualitimes[0]).filter(time => time !== ""))) {
                            q1class = "sector-red";
                        }
                        // if the time is fastest of chosen drivers, green
                        if (q1.time === Math.min(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.qualitimes[0]).filter(time => time !== ""))) {
                            q1class = "sector-green";
                        }
                        // if the time is fastest of all in the session, purple
                        if (q1.time === Math.min(...qualiData.map(driver => driver.qualitimes[0]).filter(time => time !== ""))) {
                             q1class = "sector-purple";
                        }

                        //same for sectors
                        if (q1.sectorTimes[0] === Math.max(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.sectortimes[0]).filter(time => time !== ""))) {
                            q1sector1class[0] = "sector-red";
                        }
                        if (q1.sectorTimes[0] === Math.min(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.sectortimes[0]).filter(time => time !== ""))) {
                            q1sector1class[0] = "sector-green";
                        }
                        if (q1.sectorTimes[0] === Math.min(...qualiData.map(driver => driver.sectortimes[0]).filter(time => time !== ""))) {
                            q1sector1class[0] = "sector-purple";
                        }

                        if (q1.sectorTimes[1] === Math.max(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.sectortimes[1]).filter(time => time !== ""))) {
                            q1sector1class[1] = "sector-red";
                        }
                        if (q1.sectorTimes[1] === Math.min(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.sectortimes[1]).filter(time => time !== ""))) {
                            q1sector1class[1] = "sector-green";
                        }
                        if (q1.sectorTimes[1] === Math.min(...qualiData.map(driver => driver.sectortimes[1]).filter(time => time !== ""))) {
                            q1sector1class[1] = "sector-purple";
                        }

                        if (q1.sectorTimes[2] === Math.max(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.sectortimes[2]).filter(time => time !== ""))) {
                            q1sector1class[2] = "sector-red";
                        }
                        if (q1.sectorTimes[2] === Math.min(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.sectortimes[2]).filter(time => time !== ""))) {
                            q1sector1class[2] = "sector-green";
                        }
                        if (q1.sectorTimes[2] === Math.min(...qualiData.map(driver => driver.sectortimes[2]).filter(time => time !== ""))) {
                            q1sector1class[2] = "sector-purple";
                        }


                    }

                    if (q2.time !== "") {
                        // if the time is slowest of all in the session, red
                        if (q2.time === Math.max(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.qualitimes[1]).filter(time => time !== ""))) {
                            q2class = "sector-red";
                        }
                        // if the time is fastest of chosen drivers, green
                        if (q2.time === Math.min(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.qualitimes[1]).filter(time => time !== ""))) {
                            q2class = "sector-green";
                        }
                        // if the time is fastest of all in the session, purple
                        if (q2.time === Math.min(...qualiData.map(driver => driver.qualitimes[1]).filter(time => time !== ""))) {
                            q2class = "sector-purple";
                        }
                    }

                    if (q3.time !== "") {
                        // if the time is slowest of all in the session, red
                        if (q3.time === Math.max(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.qualitimes[2]).filter(time => time !== ""))) {
                            q3class = "sector-red";
                        }
                        // if the time is fastest of chosen drivers, green
                        if (q3.time === Math.min(...qualiData.filter(driver => DriverCodes.includes(driver.driver)).map(driver => driver.qualitimes[2]).filter(time => time !== ""))) {
                            q3class = "sector-green";
                        }
                        // if the time is fastest of all in the session, purple
                        if (q3.time === Math.min(...qualiData.map(driver => driver.qualitimes[2]).filter(time => time !== ""))) {
                            q3class = "sector-purple";
                        }
                    }

                    const q1Cell = `
                        <div class="q-session cell">
                            <div class=${q1class}>${millisToMinuteString(q1.time)} (${q1.tyres})</div>
                            <div class="sector-times">
                                ${q1.sectorTimes.map((time, index) => `<div class="sector-cell ${q1sector1class[index]}">${millisToMinuteString(time)}</div>`).join('')}
                            </div>
                        </div>
                    `;
                    
                    const q2Cell = `
                        <div class="q-session cell">
                            <div class=${q2class}>${millisToMinuteString(q2.time)} (${q2.tyres})</div>
                            <div class="sector-times">
                                ${q2.sectorTimes.map(time => `<div class="sector-cell">${millisToMinuteString(time)}</div>`).join('')}
                            </div>
                        </div>
                    `;
                    
                    const q3Cell = `
                        <div class="q-session cell">
                            <div class=${q3class}>${millisToMinuteString(q3.time)} (${q3.tyres})</div>
                            <div class="sector-times">
                                ${q3.sectorTimes.map(time => `<div class="sector-cell">${millisToMinuteString(time)}</div>`).join('')}
                            </div>
                        </div>
                    `;
                
                    grid.innerHTML += driverNameCell + q1Cell + q2Cell + q3Cell;
                }
        });
    }

    useEffect(() => {
        loadCircuit(circuitId);
    }, [circuitId]);

    useEffect(() => {
        loadQualiSession();
    }, [year, session]);

    useEffect(() => {
        fillGrid();
    }, [qualiData, DriverCodes]);

    useEffect(() => {
        fillGrid();

    }, [DriverColors]);

    return (
        <div className="datacontainer"> {/* Use className for styling */}
            <div class="session__header">
                <div>
                <h1>{circuitId}</h1>
                <h2>{year}</h2>
                </div>
                <img src={circuit} alt="circuitmap" />
            </div>
            <div class="qualifying-grid">
                <div class="header">Driver</div>
                <div class="header">Q1</div>
                <div class="header">Q2</div>
                <div class="header">Q3</div>
            </div>
            {DriverCodes.length > 0 && Qualispeed[DriverCodes[DriverCodes.length - 1]] !== undefined && ( 
            <Line
                
                data={{
                    datasets: DriverCodes.map(driver => {
                        if (Qualispeed[driver] === undefined || Qualispeed[driver]["Time"].length === 0 || Qualispeed[driver]["Speed"].length === 0){
                            return {
                                label: driver,
                                data: [],
                                borderColor: "#" + Math.floor(Math.random()*16777215).toString(16),
                                fill: false
                            };
                        }
                        return {
                            label: driver,
                            data: Qualispeed[driver]["Time"].map((time, index) => ({ x: time, y: Qualispeed[driver]["Speed"][index] })),
                            borderColor: DriverColors[driver] !== undefined ? "#" + DriverColors[driver] : "#" + Math.floor(Math.random()*16777215).toString(16),
                            fill: false
                        };
                    })

                }}
                options={{
                    scales: {
                        x: {
                            type: 'linear', // Use linear scale for time data
                            position: 'bottom',
                            title: {
                                display: true,
                                text: 'Time (seconds)' // Adjust x-axis title accordingly
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Speed (km/h)' // Adjust y-axis title if needed
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "Fastest lap live speed"
                        }
                    }

                }}
            />
)}
 {DriverCodes.length > 0 && qualiData.length > 0 && qualiData[DriverCodes.length - 1] !== undefined && ( 
            <Line
                    
                    data={{
                        datasets: DriverCodes.map(driver => {
                            if (qualiData.filter(data => data.driver === driver).length === 0){
                                return {
                                    label: driver,
                                    data: [],
                                    borderColor: "#" + Math.floor(Math.random()*16777215).toString(16),
                                    fill: false
                                };
                            }
                            return {
                                label: driver,
                                data: qualiData.filter(data => data.driver === driver)[0].all_times.map((time, index) => ({ x: index + 1, y: time/1000 })),
                                borderColor: DriverColors[driver] !== undefined ? "#" + DriverColors[driver] : "#" + Math.floor(Math.random()*16777215).toString(16),
                                fill: false
                            };
                        })
    
                    }}
                    options={{
                        scales: {
                            x: {
                                type: 'linear', // Use linear scale for time data
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: 'Lap' // Adjust x-axis title accordingly
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Time (seconds)' // Adjust y-axis title if needed
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: "Qualifying lap times"
                            }
                        }
    
                    }}
        />
)}
        </div>
    );

}

export default QualiView;