import { useEffect } from "react";
import "./LapTimesTable.css";

function LapTimesTable({ SelectedDrivers, Laptimes, numLaps }) {
    useEffect(() => {
        if (Laptimes !== undefined && SelectedDrivers !== undefined && SelectedDrivers.length > 0){
            const table = document.querySelector(".lapTimesTable");
            table.innerHTML = "";
            const thead = document.createElement("thead");
            const tbody = document.createElement("tbody");
            const headerRow = document.createElement("tr");
            let headers = ["Driver"];
            for (let i = 0; i < numLaps; i++){
                headers.push(`${i + 1}`);
            }
            headers.forEach((header) => {
                const th = document.createElement("th");
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            SelectedDrivers.map((driver, index) => {
                const row = document.createElement("tr");
                const driverCell = document.createElement("td");
                driverCell.textContent = driver;
                row.appendChild(driverCell);
                for (let i = 0; i < numLaps; i++) {
                    const lapCell = document.createElement("td");
                    if (Laptimes[driver] !== undefined && Laptimes[driver].length > 0 && Laptimes[driver][i] !== undefined) {
                        // transform laptime from milliseconds to minutes:seconds.milliseconds
                        const laptime = Laptimes[driver][i];
                        const minutes = Math.floor(laptime / 60);
                        const seconds = Math.floor((laptime % 60));
                        const milliseconds = laptime % 1 * 100;
                        //cut off till 2 decimal places
                        lapCell.textContent = `${minutes}:${seconds}.${Math.floor(milliseconds / 10)}`;
                        let numDrivers = SelectedDrivers.length;
                        let fastest = undefined;
                        let slowest = undefined;
                        if (numDrivers > 1) {
                            SelectedDrivers.map((driver) => {
                                if (Laptimes[driver] !== undefined && Laptimes[driver].length > 0 && Laptimes[driver][i] !== undefined) {
                                    numDrivers++;
                                    if (fastest === undefined || Laptimes[driver][i] < fastest) {
                                        fastest = Laptimes[driver][i];
                                    }
                                    if (slowest === undefined || Laptimes[driver][i] > slowest) {
                                        slowest = Laptimes[driver][i];
                                    }
                                }
                                numDrivers++;
                            });
                            
                            if (slowest === Laptimes[driver][i]) {
                                lapCell.className = "slowest";

                            } else if (fastest === Laptimes[driver][i]) {
                                lapCell.className = "fastest";
                            }
                        }
                    }
                    row.appendChild(lapCell);
                }
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
        } else {
            console.log("No data to display");
        }
    }, [SelectedDrivers, Laptimes, numLaps]);

    return (
        <table className="lapTimesTable"></table>
    );

}

export default LapTimesTable;