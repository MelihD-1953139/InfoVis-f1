from flask import Flask
import fastf1
app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(port=8000,debug=True)