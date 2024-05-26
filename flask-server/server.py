from flask import Flask, jsonify
from flask import request
from flask_cors import CORS
from io import StringIO
import pandas as pd
import fastf1
import fastf1.plotting as f1plot
app = Flask(__name__)
CORS(app)


@app.route('/tyres')
def tyres():
    year = request.args.get('year')
    round_number = request.args.get('round')
    drivers = request.args.get('drivers')

    drivers = drivers.split(",")

    session = fastf1.get_session(int(year), int(round_number), "R")
    session.load()

    all_compounds = {}

    for driver in drivers:
        driverlaps = session.laps.pick_driver(driver)
        tyre_data = driverlaps.Compound
        tyre_data = tyre_data.to_dict()
        # convert to array
        tyre_data = list(tyre_data.values())
        all_compounds[driver] = tyre_data

    return all_compounds

@app.route('/driverinfo')
def driverinfo():
    drivers = request.args.get('drivers')

    drivers = drivers.split(",")

    all_driver_info = {}

    for driver in drivers:
        color = fastf1.ff1.plotting.driver_color(driver)
        print(color)
        driver_info = {
            "color": color
        }


    return all_driver_info

# Route
@app.route('/year/<int:year>')
def test(year):
    #session = fastf1.get_session(1995, 1)
    #session.event
    session = fastf1.get_session(2023, 3, 'R')
    session.load()

    # for drv in session.drivers:
    #     drv_laps = session.laps.pick_driver(drv)

    #     abb = drv_laps['Driver'].iloc[0]
    #     color = fastf1.plotting.driver_color(abb)

    #     ax.plot(drv_laps['LapNumber'], drv_laps['Position'],
    #             label=abb, color=color)

    print("f")
    return {'test': f"You entered {year}"}


@app.route('/<int:year>/<int:race>/tires')
def tireusage(year, race):
    session = fastf1.get_session(year,  race, 'R')
    session.load()
    laps = session.laps
    drivers = session.drivers
    driversWithTheirCodes = {session.get_driver(driver)["Abbreviation"]: session.get_driver(driver)["DriverId"] for driver in drivers}
    driverWithColors = {session.get_driver(driver)["Abbreviation"]: session.get_driver(driver)["TeamColor"] for driver in drivers}
    stints = laps[["Driver", "Stint", "Compound", "LapNumber"]]
    stints = stints.groupby(["Driver", "Stint", "Compound"])
    stints = stints.count().reset_index()

    stints = stints.rename(columns={"LapNumber": "StintLength"})
    # Grouping by Driver and creating lists of compounds and stint lengths
    driver_data = stints.groupby('Driver').apply(lambda x: {
        'compound': x['Compound'].tolist(),
        'stintlength': x['StintLength'].tolist(),
    }).to_dict()
    # Converting to the desired JSON format
    json_data = {driversWithTheirCodes[driver]: {'code': driver, 'color': '#'+driverWithColors[driver],'compound': data['compound'], 'stintlength': data['stintlength']} for driver, data in driver_data.items()}

    return json_data

if __name__ == '__main__':
    app.run(port=8000,debug=True)