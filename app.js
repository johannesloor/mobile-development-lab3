// JavaScript code for the Arduino Beacon example app.

// Application object.
var app = {}

// Regions that define which page to show for each beacon.
app.beaconRegions =
[
	{
		id: 'memory-page',
		uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
		major: 56506,
		minor: 14941
	},
	{
		id: 'solution-page',
		uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
		major: 22460,
		minor: 60720
	},
	{
		id: 'treasure-page',
		uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
		major: 64748,
		minor: 20535
	}
]

// Currently displayed page.
app.currentPage = 'page-default'

app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		app.onDeviceReady,
		false)
	app.gotoPage(app.currentPage)
}

// Called when Cordova are plugins initialised,
// the iBeacon API is now available.
app.onDeviceReady = function()
{
	// Specify a shortcut for the location manager that
	// has the iBeacon functions.
	window.locationManager = cordova.plugins.locationManager

	// Start tracking beacons!
	app.startScanForBeacons()
}

app.startScanForBeacons = function()
{
	//console.log('startScanForBeacons')

	// The delegate object contains iBeacon callback functions.
	var delegate = new cordova.plugins.locationManager.Delegate()

	delegate.didDetermineStateForRegion = function(pluginResult)
	{
		//console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
	}

	delegate.didStartMonitoringForRegion = function(pluginResult)
	{
		//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
	}

	delegate.didRangeBeaconsInRegion = function(pluginResult)
	{
		//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
		app.didRangeBeaconsInRegion(pluginResult)
	}

	// Set the delegate object to use.
	locationManager.setDelegate(delegate)

	// Start monitoring and ranging our beacons.
	for (var r in app.beaconRegions)
	{
		var region = app.beaconRegions[r]

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor)

		// Start monitoring.
		locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done()

		// Start ranging.
		locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done()
	}
}

// Display pages depending of which beacon is close.
app.didRangeBeaconsInRegion = function(pluginResult)
{
	//console.log('numbeacons in region: ' + pluginResult.beacons.length)

	// There must be a beacon within range.
	if (0 == pluginResult.beacons.length)
	{
		return
	}

	// Our regions are defined so that there is one beacon per region.
	// Get the first (and only) beacon in range in the region.
	var beacon = pluginResult.beacons[0]
	// The region identifier is the page id.
	var pageId = pluginResult.region.identifier

	//console.log('ranged beacon: ' + pageId + ' ' + beacon.proximity)

	// If the beacon is close and represents a new page, then show the page.
	if ((beacon.rssi > -75 && beacon.rssi < 0) // == 'ProximityImmediate' || beacon.proximity == 'ProximityNear')
		&& app.currentPage != pageId)
	{

		app.gotoPage(pageId, false)
		return
	}

	// If the beacon represents the current page but is far away,
	// then show the default page.
	if ((beacon.rssi < -87) //.proximity == 'ProximityFar')
		&& app.currentPage == pageId)
	{
		app.gotoPage('page-default', true)
		return
	}

}

let listofsignals = [];

app.gotoPage = function(pageId, gettingcolder)
{
	if (gettingcolder) {
		if (listofsignals.length < 1) {
			listofsignals.push(pageId);
		}
		else {
			let i;
			let oldIdNotMatch = false;
			for (i = 0 ; i < listofsignals.length ; i++) {
				if (listofsignals[i] != pageId) {
					oldIdNotMatch = true
				}
			}
			if (oldIdNotMatch) {
				listofsignals.splice(0, listofsignals.length)
			}
			else {
				listofsignals.push(pageId)
			}
		}
		if (listofsignals.length == 2) {
			app.hidePage(app.currentPage)
			app.showPage(pageId)
			app.currentPage = pageId
			listofsignals.splice(0, listofsignals.length)
		}
	}
	else{
		app.hidePage(app.currentPage)
		app.showPage(pageId)
		app.currentPage = pageId
	}

}

app.showPage = function(pageId)
{
	document.getElementById(pageId).style.display = 'block'
}

app.hidePage = function(pageId)
{
	document.getElementById(pageId).style.display = 'none'
}

// Set up the application.
app.initialize()
