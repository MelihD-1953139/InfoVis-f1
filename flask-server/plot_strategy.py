"""
Tyre strategies during a race
=============================

Plot all drivers' tyre strategies during a race.
"""

import json
from matplotlib import pyplot as plt

import fastf1
import fastf1.plotting


###############################################################################
# Load the race session

session = fastf1.get_session(2021, 1, 'R')
session.load()
laps = session.laps

###############################################################################
# Get the list of driver numbers
drivers = session.drivers

print(drivers)
###############################################################################
# Convert the driver numbers to three letter abbreviations

drivers_list = [{session.get_driver(driver)["Abbreviation"]: session.get_driver(driver)["DriverId"]} for driver in drivers]
driversL = {}
for driver in drivers:
    driversL[session.get_driver(driver)["Abbreviation"]] = session.get_driver(driver)["DriverId"]

print(driversL)
print(drivers_list)

# Create a dictionary from the list of dictionaries
drivers_dict = {list(d.keys())[0]: list(d.values())[0] for d in drivers_list}

# Function to get driver name by code
def get_driver_name(driver_code):
    if driver_code in drivers_dict:
        return drivers_dict[driver_code]
    else:
        return None

# Example usage
driver_code = "HAM"
driver_name = get_driver_name(driver_code)
if driver_name:
    print(f"The driver name for code {driver_code} is {driver_name}.")
else:
    print(f"No driver found with code {driver_code}.")

drivers = [session.get_driver(driver)["Abbreviation"] for driver in drivers]

# print(session.weather_data)

###############################################################################
# We need to find the stint length and compound used
# for every stint by every driver.
# We do this by first grouping the laps by the driver,
# the stint number, and the compound.
# And then counting the number of laps in each group.
stints = laps[["Driver", "Stint", "Compound", "LapNumber"]]
stints = stints.groupby(["Driver", "Stint", "Compound"])
stints = stints.count().reset_index()
###############################################################################
# The number in the LapNumber column now stands for the number of observations
# in that group aka the stint length.
stints = stints.rename(columns={"LapNumber": "StintLength"})
# Grouping by Driver and creating lists of compounds and stint lengths
driver_data = stints.groupby('Driver').apply(lambda x: {
    'tires': x['Compound'].tolist(),
    'laps': x['StintLength'].tolist()
}).to_dict()

# Converting to the desired JSON format
json_data = {driversL[driver]: {'code': driver, 'tires': data['tires'], 'laps': data['laps']} for driver, data in driver_data.items()}

print(json_data)

###############################################################################
# Now we can plot the strategies for each driver
fig, ax = plt.subplots(figsize=(5, 10))

for driver in drivers:
    driver_stints = stints.loc[stints["Driver"] == driver]

    previous_stint_end = 0
    for idx, row in driver_stints.iterrows():
        # each row contains the compound name and stint length
        # we can use these information to draw horizontal bars
        plt.barh(
            y=driver,
            width=row["StintLength"],
            left=previous_stint_end,
            color=fastf1.plotting.COMPOUND_COLORS[row["Compound"]],
            edgecolor="black",
            data=row["Compound"],
            fill=True
        )

        previous_stint_end += row["StintLength"]

# sphinx_gallery_defer_figures

###############################################################################
# Make the plot more readable and intuitive
plt.title("2022 Hungarian Grand Prix Strategies")
plt.xlabel("Lap Number")
plt.grid(False)
# invert the y-axis so drivers that finish higher are closer to the top
ax.invert_yaxis()

# sphinx_gallery_defer_figures

###############################################################################
# Plot aesthetics
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)

plt.tight_layout()
plt.show()
