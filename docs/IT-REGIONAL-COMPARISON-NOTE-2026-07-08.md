# Short Note for IT: Regional Comparison Dashboard Status

I reviewed the Regional Comparison section of the dashboard and confirmed that there were two separate issues.

First, there was a live API problem affecting the `Regional Demographics` and `Educational Attainment` tabs. I fixed the Worker/backend logic so those metro-level Census requests now use the Census API key correctly, and I redeployed the live Worker on July 8, 2026.

Second, there is also a design/scope difference across the Regional Comparison tabs:

- `Texas County/MSA Compare` is county-based
- `Regional Employment` is county-based and supports all 254 Texas counties
- `Regional Demographics` is currently metro-based
- `Educational Attainment` is currently metro-based

That means it is expected that not all counties will appear in the `Regional Demographics` and `Educational Attainment` dropdowns, because those two tabs are currently built around a fixed list of Texas metro areas rather than a county-level dataset.

At the moment, the metro list includes:

- Tyler, TX Metro Area
- Waco, TX Metro Area
- Dallas-Fort Worth-Arlington, TX Metro Area
- Houston-The Woodlands-Sugar Land, TX Metro Area
- Austin-Round Rock-Georgetown, TX Metro Area
- San Antonio-New Braunfels, TX Metro Area
- Longview, TX Metro Area
- Beaumont-Port Arthur, TX Metro Area

I also updated the handoff build so that if the live multi-year demographics or education API returns only partial data, the dashboard will fall back to the bundled dataset instead of showing an incomplete response.

Current practical status:

- county-level Regional Employment is working
- county-level Texas County/MSA Compare is working
- metro-level Demographics and Education are working more safely now
- Demographics and Education are still not county-level features in the current dashboard design

If UT Tyler wants `Regional Demographics` or `Educational Attainment` to support all counties, that would be a separate enhancement. It would require:

- a county-level data model for those sections
- county-level Census processing for those indicators
- UI updates to support county-based selection in those tabs

In short, the missing counties in those two tabs are not only a bug. They mostly reflect the current scope of the dashboard.
