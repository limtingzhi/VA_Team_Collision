$(document).ready(function() {
	initDataForAllCharts();
});

$(document).on('change','#monthdropdown',function(){
	initDataForAllCharts();
	onClickStatus = false;
});

var preDataForAll = null,
timeFormat = d3.time.format("%H:%M"),
hourFormat = d3.time.format("%I%p"),
percentageFormat = d3.format("%"),
onClickStatus = false, 
selectedConditions = null,
selectedPercentage = null;

function initDataForAllCharts(){
	d3.select("#chart").select("svg").remove();
	d3.select("#sequence").select("svg").remove();
	d3.select("#sequence").select("#select-msg").remove();
	d3.select("#legend").select("svg").remove();
	d3.select("#rb-chart").select(".radial-barchart-svg").remove();
	d3.select("#histogram").select(".histogram").remove();
	d3.select("#dayofweekbarchart").select(".dowbarchart").remove();
	d3.select("#weatherconditionchart").select(".wconditionchart").remove();
	d3.select("#roadsurfaceconditionchart").select(".rsconditionchart").remove();
	
	var dataFile = "./data/data_cleaned.csv";
	var filterConditions = null;
	var filterPercentage= null;
	
	preDataForAll = d3.csv(dataFile, function(error, preDataForAll) {
		var e = document.getElementById("monthdropdown");
		var strUser = e.options[e.selectedIndex].value;
		
		preDataForAll = preDataForAll.filter(function(d){ 
			if (parseInt(d.Month) == parseInt(strUser)) { // random
				return d;
			} 
		})

		preDataForAll.forEach(function(d) {
			var time = timeFormat.parse(d.Time);
			var roundedHour = d3.time.hour.floor(time);
			d.time = hourFormat(roundedHour);
		});

		initSunburst(preDataForAll);
		rbUpdate(preDataForAll);
		initDriversHistogram(preDataForAll, true);
		initDayofWeekBarChart(preDataForAll, true);
		initWeatherCondition(preDataForAll, true);
		initRoadSurfaceCondition(preDataForAll, true);
	});
}

function initSunburst(data) {
	d3.select("#reset").on("click", resetVisualisation);

	// Dimensions of sunburst
	var width = 425;
	var height = 350;
	var radius = Math.min(width, height) / 2;

	// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
	var b = {
		w: 95, h: 30, s: 2, t: 5
	};

	// Mapping of step names to colors.
	var colors = {
		"Age 0 to 10": "#039BE5",
		"Age 11 to 20": "#039BE5",
		"Age 21 to 30": "#039BE5",
		"Age 31 to 40": "#039BE5",
		"Age 41 to 50": "#039BE5",
		"Age 51 to 60": "#039BE5",
		"Age 61 to 70": "#039BE5",
		"Age 71 to 80": "#039BE5",
		"Above Age 80": "#039BE5",
		"Driver/Rider": "#FFA000",
		"Passenger": "#FF8F00",
		"Pedestrian": "#EF6C00",
		"Fatal": "#B71C1C",
		"Serious": "#E53935",
		"Minor": "#F06461"
	};

	//Cross Filter Data & set up dimensions
	var xfilter = crossfilter(data);
	var casualtyAgeBinDim = xfilter.dimension(function(d){return d.Casualty_Age_Bins}),
		casualtyClassDim = xfilter.dimension(function(d){return d.Casualty_Class}),
		casualtySeverityDim = xfilter.dimension(function(d){return d.Casualty_Severity});

	// Total size of all segments; we set this later, after loading the data.
	var totalSize = 0; 

	var vis = d3.select("#chart").append("svg:svg")
		.attr("width", width)
		.attr("height", height)
		.append("svg:g")
		.attr("id", "sbcontainer")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var partition = d3.layout.partition()
		.size([2 * Math.PI, radius * radius])
		.value(function(d) { return d.size; });

	var arc = d3.svg.arc()
		.startAngle(function(d) { return d.x; })
		.endAngle(function(d) { return d.x + d.dx; })
		.innerRadius(function(d) { return Math.sqrt(d.y); })
		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

	// Use d3.text and d3.csv.parseRows so that we do not need to have a header
	// row, and can receive the csv as an array of arrays.

	var csv = processCsv(data);
	var json = buildHierarchy(csv);
	createVisualization(json);

	/* d3.text("data/data_jan.csv", function(text) {
		var csvPre = d3.csv.parseRows(text);
		//var csv = processCsv(csvPre);
		//console.log("Done: "+csv.length);
		var json = buildHierarchy(csv);
		createVisualization(json);
		//console.log("DONE: ");
	}); */

	function processCsv(csv) {
		var ageBin10 = 0;
		var ageBin10DriverFatal = 0;
		var ageBin10DriverSerious = 0;
		var ageBin10DriverSlight = 0;
		var ageBin10PassengerFatal = 0;
		var ageBin10PassengerSerious = 0;
		var ageBin10PassengerSlight = 0;
		var ageBin10PedFatal = 0;
		var ageBin10PedSerious = 0;
		var ageBin10PedSlight = 0;
		var ageBin20 = 0;
		var ageBin20DriverFatal = 0;
		var ageBin20DriverSerious = 0;
		var ageBin20DriverSlight = 0;
		var ageBin20PassengerFatal = 0;
		var ageBin20PassengerSerious = 0;
		var ageBin20PassengerSlight = 0;
		var ageBin20PedFatal = 0;
		var ageBin20PedSerious = 0;
		var ageBin20PedSlight = 0;
		var ageBin30 = 0;
		var ageBin30DriverFatal = 0;
		var ageBin30DriverSerious = 0;
		var ageBin30DriverSlight = 0;
		var ageBin30PassengerFatal = 0;
		var ageBin30PassengerSerious = 0;
		var ageBin30PassengerSlight = 0;
		var ageBin30PedFatal = 0;
		var ageBin30PedSerious = 0;
		var ageBin30PedSlight = 0;
		var ageBin40 = 0;
		var ageBin40DriverFatal = 0;
		var ageBin40DriverSerious = 0;
		var ageBin40DriverSlight = 0;
		var ageBin40PassengerFatal = 0;
		var ageBin40PassengerSerious = 0;
		var ageBin40PassengerSlight = 0;
		var ageBin40PedFatal = 0;
		var ageBin40PedSerious = 0;
		var ageBin40PedSlight = 0;
		var ageBin50 = 0;
		var ageBin50DriverFatal = 0;
		var ageBin50DriverSerious = 0;
		var ageBin50DriverSlight = 0;
		var ageBin50PassengerFatal = 0;
		var ageBin50PassengerSerious = 0;
		var ageBin50PassengerSlight = 0;
		var ageBin50PedFatal = 0;
		var ageBin50PedSerious = 0;
		var ageBin50PedSlight = 0;
		var ageBin60 = 0;
		var ageBin60DriverFatal = 0;
		var ageBin60DriverSerious = 0;
		var ageBin60DriverSlight = 0;
		var ageBin60PassengerFatal = 0;
		var ageBin60PassengerSerious = 0;
		var ageBin60PassengerSlight = 0;
		var ageBin60PedFatal = 0;
		var ageBin60PedSerious = 0;
		var ageBin60PedSlight = 0;
		var ageBin70 = 0;
		var ageBin70DriverFatal = 0;
		var ageBin70DriverSerious = 0;
		var ageBin70DriverSlight = 0;
		var ageBin70PassengerFatal = 0;
		var ageBin70PassengerSerious = 0;
		var ageBin70PassengerSlight = 0;
		var ageBin70PedFatal = 0;
		var ageBin70PedSerious = 0;
		var ageBin70PedSlight = 0;
		var ageBin80 = 0;
		var ageBin80DriverFatal = 0;
		var ageBin80DriverSerious = 0;
		var ageBin80DriverSlight = 0;
		var ageBin80PassengerFatal = 0;
		var ageBin80PassengerSerious = 0;
		var ageBin80PassengerSlight = 0;
		var ageBin80PedFatal = 0;
		var ageBin80PedSerious = 0;
		var ageBin80PedSlight = 0;
		var ageBin90 = 0;
		var ageBin90DriverFatal = 0;
		var ageBin90DriverSerious = 0;
		var ageBin90DriverSlight = 0;
		var ageBin90PassengerFatal = 0;
		var ageBin90PassengerSerious = 0;
		var ageBin90PassengerSlight = 0;
		var ageBin90PedFatal = 0;
		var ageBin90PedSerious = 0;
		var ageBin90PedSlight = 0;
		
		data.forEach(function(record) {
			if (record.Casualty_Age_Bins == "Age 0 to 10") {
				if (record.Casualty_Class=="Driver/Rider"){
					//console.log("Class: "+record.Casualty_Class+",Age: "+record.Age_of_Casualty+",Condition: "+record.Casualty_Severity);
					if (record.Casualty_Severity=="Fatal") {
						ageBin10DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin10DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin10DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin10PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin10PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin10PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin10PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin10PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin10PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 11 to 20") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin20DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin20DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin20DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin20PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin20PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin20PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin20PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin20PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin20PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 21 to 30") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin30DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin30DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin30DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin30PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin30PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin30PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin30PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin30PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin30PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 31 to 40") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin40DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin40DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin40DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin40PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin40PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin40PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin40PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin40PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin40PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 41 to 50") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin50DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin50DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin50DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin50PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin50PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin50PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin50PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin50PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin50PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 51 to 60") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin60DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin60DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin60DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin60PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin60PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin60PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin60PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin60PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin60PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 61 to 70") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin70DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin70DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin70DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin70PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin70PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin70PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin70PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin70PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin70PedSlight++;
					}
				}
			} else if (record.Casualty_Age_Bins == "Age 71 to 80") {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin80DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin80DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin80DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin80PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin80PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin80PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin80PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin80PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin80PedSlight++;
					}
				}
			} else {
				if (record.Casualty_Class=="Driver/Rider"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin90DriverFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin90DriverSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin90DriverSlight++;
					}
				} else if (record.Casualty_Class=="Passenger"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin90PassengerFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin90PassengerSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin90PassengerSlight++;
					}
				} else if (record.Casualty_Class=="Pedestrian"){
					if (record.Casualty_Severity=="Fatal") {
						ageBin90PedFatal++;
					}else if (record.Casualty_Severity=="Serious") {
						ageBin90PedSerious++;
					}else if (record.Casualty_Severity=="Minor"){
						ageBin90PedSlight++;
					}
				}
			}
		});

		// console.log("Convert to hierarchical format... done!");
		var result = [];
			result.push(["Age 0 to 10-Driver/Rider-Fatal","",ageBin10DriverFatal]);
		result.push(["Age 0 to 10-Driver/Rider-Serious",""+ageBin10DriverSerious]);
		result.push(["Age 0 to 10-Driver/Rider-Minor",""+ageBin10DriverSlight]);
		result.push(["Age 0 to 10-Passenger-Fatal",""+ageBin10PassengerFatal]);
		result.push(["Age 0 to 10-Passenger-Serious",""+ageBin10PassengerSerious]);
		result.push(["Age 0 to 10-Passenger-Minor",""+ageBin10PassengerSlight]);
		result.push(["Age 0 to 10-Pedestrian-Fatal",""+ageBin10PedFatal]);
		result.push(["Age 0 to 10-Pedestrian-Serious",""+ageBin10PedSerious]);
		result.push(["Age 0 to 10-Pedestrian-Minor",""+ageBin10PedSlight]);
			result.push(["Age 11 to 20-Driver/Rider-Fatal",""+ageBin20DriverFatal]);
		result.push(["Age 11 to 20-Driver/Rider-Serious",""+ageBin20DriverSerious]);
		result.push(["Age 11 to 20-Driver/Rider-Minor",""+ageBin20DriverSlight]);
		result.push(["Age 11 to 20-Passenger-Fatal",""+ageBin20PassengerFatal]);
		result.push(["Age 11 to 20-Passenger-Serious",""+ageBin20PassengerSerious]);
		result.push(["Age 11 to 20-Passenger-Minor",""+ageBin20PassengerSlight]);
		result.push(["Age 11 to 20-Pedestrian-Fatal",""+ageBin20PedFatal]);
		result.push(["Age 11 to 20-Pedestrian-Serious",""+ageBin20PedSerious]);
		result.push(["Age 11 to 20-Pedestrian-Minor",""+ageBin20PedSlight]);
			result.push(["Age 21 to 30-Driver/Rider-Fatal",""+ageBin30DriverFatal]);
		result.push(["Age 21 to 30-Driver/Rider-Serious",""+ageBin30DriverSerious]);
		result.push(["Age 21 to 30-Driver/Rider-Minor",""+ageBin30DriverSlight]);
		result.push(["Age 21 to 30-Passenger-Fatal",""+ageBin30PassengerFatal]);
		result.push(["Age 21 to 30-Passenger-Serious",""+ageBin30PassengerSerious]);
		result.push(["Age 21 to 30-Passenger-Minor",""+ageBin30PassengerSlight]);
		result.push(["Age 21 to 30-Pedestrian-Fatal",""+ageBin30PedFatal]);
		result.push(["Age 21 to 30-Pedestrian-Serious",""+ageBin30PedSerious]);
		result.push(["Age 21 to 30-Pedestrian-Minor",""+ageBin30PedSlight]);
			result.push(["Age 31 to 40-Driver/Rider-Fatal",""+ageBin40DriverFatal]);
		result.push(["Age 31 to 40-Driver/Rider-Serious",""+ageBin40DriverSerious]);
		result.push(["Age 31 to 40-Driver/Rider-Minor",""+ageBin40DriverSlight]);
		result.push(["Age 31 to 40-Passenger-Fatal",""+ageBin40PassengerFatal]);
		result.push(["Age 31 to 40-Passenger-Serious",""+ageBin40PassengerSerious]);
		result.push(["Age 31 to 40-Passenger-Minor",""+ageBin40PassengerSlight]);
		result.push(["Age 31 to 40-Pedestrian-Fatal",""+ageBin40PedFatal]);
		result.push(["Age 31 to 40-Pedestrian-Serious",""+ageBin40PedSerious]);
		result.push(["Age 31 to 40-Pedestrian-Minor",""+ageBin40PedSlight]);
			result.push(["Age 41 to 50-Driver/Rider-Fatal",""+ageBin50DriverFatal]);
		result.push(["Age 41 to 50-Driver/Rider-Serious",""+ageBin50DriverSerious]);
		result.push(["Age 41 to 50-Driver/Rider-Minor",""+ageBin50DriverSlight]);
		result.push(["Age 41 to 50-Passenger-Fatal",""+ageBin50PassengerFatal]);
		result.push(["Age 41 to 50-Passenger-Serious",""+ageBin50PassengerSerious]);
		result.push(["Age 41 to 50-Passenger-Minor",""+ageBin50PassengerSlight]);
		result.push(["Age 41 to 50-Pedestrian-Fatal",""+ageBin50PedFatal]);
		result.push(["Age 41 to 50-Pedestrian-Serious",""+ageBin50PedSerious]);
		result.push(["Age 41 to 50-Pedestrian-Minor",""+ageBin50PedSlight]);
			result.push(["Age 51 to 60-Driver/Rider-Fatal",""+ageBin60DriverFatal]);
		result.push(["Age 51 to 60-Driver/Rider-Serious",""+ageBin60DriverSerious]);
		result.push(["Age 51 to 60-Driver/Rider-Minor",""+ageBin60DriverSlight]);
		result.push(["Age 51 to 60-Passenger-Fatal",""+ageBin60PassengerFatal]);
		result.push(["Age 51 to 60-Passenger-Serious",""+ageBin60PassengerSerious]);
		result.push(["Age 51 to 60-Passenger-Minor",""+ageBin60PassengerSlight]);
		result.push(["Age 51 to 60-Pedestrian-Fatal",""+ageBin60PedFatal]);
		result.push(["Age 51 to 60-Pedestrian-Serious",""+ageBin60PedSerious]);
		result.push(["Age 51 to 60-Pedestrian-Minor",""+ageBin60PedSlight]);
			result.push(["Age 61 to 70-Driver/Rider-Fatal",""+ageBin70DriverFatal]);
		result.push(["Age 61 to 70-Driver/Rider-Serious",""+ageBin70DriverSerious]);
		result.push(["Age 61 to 70-Driver/Rider-Minor",""+ageBin70DriverSlight]);
		result.push(["Age 61 to 70-Passenger-Fatal",""+ageBin70PassengerFatal]);
		result.push(["Age 61 to 70-Passenger-Serious",""+ageBin70PassengerSerious]);
		result.push(["Age 61 to 70-Passenger-Minor",""+ageBin70PassengerSlight]);
		result.push(["Age 61 to 70-Pedestrian-Fatal",""+ageBin70PedFatal]);
		result.push(["Age 61 to 70-Pedestrian-Serious",""+ageBin70PedSerious]);
		result.push(["Age 61 to 70-Pedestrian-Minor",""+ageBin70PedSlight]);
			result.push(["Age 71 to 80-Driver/Rider-Fatal",""+ageBin80DriverFatal]);
		result.push(["Age 71 to 80-Driver/Rider-Serious",""+ageBin80DriverSerious]);
		result.push(["Age 71 to 80-Driver/Rider-Minor",""+ageBin80DriverSlight]);
		result.push(["Age 71 to 80-Passenger-Fatal",""+ageBin80PassengerFatal]);
		result.push(["Age 71 to 80-Passenger-Serious",""+ageBin80PassengerSerious]);
		result.push(["Age 71 to 80-Passenger-Minor",""+ageBin80PassengerSlight]);
		result.push(["Age 71 to 80-Pedestrian-Fatal",""+ageBin80PedFatal]);
		result.push(["Age 71 to 80-Pedestrian-Serious",""+ageBin80PedSerious]);
		result.push(["Age 71 to 80-Pedestrian-Minor",""+ageBin80PedSlight]);
			result.push(["Above Age 80-Driver/Rider-Fatal",""+ageBin90DriverFatal]);
		result.push(["Above Age 80-Driver/Rider-Serious",""+ageBin90DriverSerious]);
		result.push(["Above Age 80-Driver/Rider-Minor",""+ageBin90DriverSlight]);
		result.push(["Above Age 80-Passenger-Fatal",""+ageBin90PassengerFatal]);
		result.push(["Above Age 80-Passenger-Serious",""+ageBin90PassengerSerious]);
		result.push(["Above Age 80-Passenger-Minor",""+ageBin90PassengerSlight]);
		result.push(["Above Age 80-Pedestrian-Fatal",""+ageBin90PedFatal]);
		result.push(["Above Age 80-Pedestrian-Serious",""+ageBin90PedSerious]);
		result.push(["Above Age 80-Pedestrian-Minor",""+ageBin90PedSlight]);
		//console.log(result);
		return result;
	}

	// Main function to draw and set up the visualization, once we have the data.
	function createVisualization(json) {
		// Basic setup of page elements.
		initializeBreadcrumbTrail();
		drawLegend();

		// Bounding circle underneath the sunburst, to make it easier to detect
		// when the mouse leaves the parent g.
		vis.append("svg:circle")
			.attr("r", radius)
			.style("opacity", 0);

		// For efficiency, filter nodes to keep only those large enough to see.
		var nodes = partition.nodes(json)
			.filter(function(d) {
				return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
			});

		var path = vis.data([json]).selectAll("path")
			.data(nodes)
			.enter().append("svg:path")
			.attr("display", function(d) { return d.depth ? null : "none"; })
			.attr("d", arc)
			.attr("fill-rule", "evenodd")
			.style("fill", function(d) { return colors[d.name]; })
			.style("opacity", 1)
			.on("mouseover", mouseover)
			.on("click",filterFunction);

		// Add the mouseleave handler to the bounding circle.
		d3.select("#sbcontainer").on("mouseleave", mouseleave);

		// Get total size of the tree = value of root node from partition.
		totalSize = path.node().__data__.value;
	};

	//On click function
	function filterFunction(){
		d3.select("#select-msg").style("visibility","hidden");

		//var filterArray = [];
		onClickStatus = true;
		// updateBreadcrumbs(filterConditions, filterPercentage);
		selectedConditions = filterConditions;
		selectedPercentage = filterPercentage;

		casualtyAgeBinDim.filterAll();
		casualtyClassDim.filterAll();
		casualtySeverityDim.filterAll();
		for (var key in filterConditions) {
			if (key == 0) {
				casualtyAgeBinDim.filter(filterConditions[key].name);
			} else if (key == 1) {
				casualtyClassDim.filter(filterConditions[key].name);
			} else if (key == 2) {
				casualtySeverityDim.filter(filterConditions[key].name);
			}
			//console.log(filterConditions[key].name);
		}
		
		var filteredResult = casualtyAgeBinDim.top(Infinity);
		rbUpdate(filteredResult);
		initDriversHistogram(filteredResult, false);
		initDayofWeekBarChart(filteredResult, false);
		initWeatherCondition(filteredResult, false);
		initRoadSurfaceCondition(filteredResult, false);
	}

	// Fade all but the current sequence, and show it in the breadcrumb trail.
	function mouseover(d) {
		var percentage = (100 * d.value / totalSize).toPrecision(3);
		var percentageString = percentage + "%";
		if (percentage < 0.1) {
			percentageString = "< 0.1%";
		}

		var textExp = percentageString + " of " + addCommas(totalSize) + " casualties are ";
		if (d.depth=="1") {
			if (d.name === "Above Age 80") {
				textExp += "<br>" + d.name.toLowerCase();
			} else {
				textExp += "from <br>" + d.name.toLowerCase();
			}
		} else if (d.depth=="2") {
			if (d.name === "Driver/Rider") {
				textExp += " drivers or riders "
			} else {
				textExp += d.name.toLowerCase() + "s ";
			}

			if (d.parent.name === "Above Age 80") {
				textExp += d.parent.name.toLowerCase();
			} else {
				textExp += "from " + d.parent.name.toLowerCase();
			}		
		} else {
			if (d.parent.name === "Driver/Rider") {
				textExp += " drivers or riders "
			} else {
				textExp += d.parent.name.toLowerCase() + "s ";
			}

			if (d.parent.parent.name === "Above Age 80") {
				textExp += d.parent.parent.name.toLowerCase();
			} else {
				textExp += "from " + d.parent.parent.name.toLowerCase();
			}
			textExp += " who have " + d.name.toLowerCase() + " injuries";
		}
		
		var g = d3.select('.sunburst-chart');

		g.select("#percentage")
			.html(textExp);
		
		g.select("#explanation")
			.style("visibility", "");

		g.select("#select-msg").style("visibility","hidden");

		var sequenceArray = getAncestors(d);
		updateBreadcrumbs(sequenceArray, percentageString);

		//Save the sequence
		filterConditions = sequenceArray;
		filterPercentage = percentageString;

		// Fade all the segments.
		g.selectAll("path")
			.style("opacity", 0.3);

		// Then highlight only those that are an ancestor of the current segment.
		vis.selectAll("path")
			.filter(function(node) {
				return (sequenceArray.indexOf(node) >= 0);
			})
			.style("opacity", 1);
	}

	// Restore everything to full opacity when moving off the visualization.
	function mouseleave(d) {
		if (onClickStatus == false) {
			var g = d3.select('.sunburst-chart');

			// Hide the breadcrumb trail
			g.select("#trail")
				.style("visibility", "hidden");

			// Deactivate all segments during transition.
			g.selectAll("path").on("mouseover", null);

			// Transition each segment to full opacity and then reactivate it.
			g.selectAll("path")
				.transition()
				.duration(500)
				.style("opacity", 1)
				.each("end", function() {
					d3.select(this).on("mouseover", mouseover);
				});

			g.select("#explanation")
				.style("visibility", "hidden");

			g.select("#select-msg").style("visibility","visible");
		} else {
			var g = d3.select('.sunburst-chart');
			
			g.select("#trail").style("visibility", "hidden");
			
			updateBreadcrumbs(selectedConditions, selectedPercentage);
			
			g.select("#trail").style("visibility", "");
			//Revert to previous sequence
			//console.log(filterConditions);
			
			g.select("#explanation").style("visibility","hidden");

			// Deactivate all segments during transition.
			g.selectAll("path").on("mouseover", null);

			// Transition each segment to full opacity and then reactivate it.
			g.selectAll("path")
				.transition()
				.duration(500)
				.style("opacity", 1)
				.each("end", function() {
					d3.select(this).on("mouseover", mouseover);
				});
		}
	}

	// Given a node in a partition layout, return an array of all of its ancestor
	// nodes, highest first, but excluding the root.
	function getAncestors(node) {
		var path = [];
		var current = node;
		while (current.parent) {
			path.unshift(current);
			current = current.parent;
		}
		return path;
	}

	function initializeBreadcrumbTrail() {
		// Add the svg area.
		var trail = d3.select("#sequence").append("svg:svg")
			.attr("width", width)
			.attr("height", 50)
			.attr("id", "trail");

		// Add the label at the end, for the percentage.
		trail.append("svg:text")
			.attr("id", "endlabel")
			.style("fill", "#000")
			.style("font-size", '12px');

		trail.append("svg:text")
			.attr("id", "front-text");

		trail.append("svg:text")
			.attr("id", "select-msg")
			.attr("x",width/2)
			.attr("y",b.h/2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.style("fill","#393939")
			.style("font-weight", "normal")
			.style("font-style", "italic")
			.style("position", "absolute")
			.text("Hover or select any area to get started");
	}

	// Generate a string that describes the points of a breadcrumb polygon.
	function breadcrumbPoints(d, i) {
		var points = [];
		points.push("0,0");
		points.push(b.w + ",0");
		points.push(b.w + b.t + "," + (b.h / 2));
		points.push(b.w + "," + b.h);
		points.push("0," + b.h);
		if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
			points.push(b.t + "," + (b.h / 2));
		}
		return points.join(" ");
	}

	// Update the breadcrumb trail to show the current sequence and percentage.
	function updateBreadcrumbs(nodeArray, percentageString) {
		// Data join; key function combines name and depth (= position in sequence).
		var g = d3.select("#trail")
			.selectAll("g")
			.data(nodeArray, function(d) { return d.name + d.depth; });

		// Add breadcrumb and label for entering nodes.
		var entering = g.enter().append("svg:g");

		entering.append("svg:polygon")
			.attr("points", breadcrumbPoints)
			.style("fill", function(d) { return colors[d.name]; });

		entering.append("svg:text")
			.attr("x", ((b.w + b.t) / 2))
			.attr("y", b.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.text(function(d) { return d.name; });

		// Set position for entering and updating nodes.
		g.attr("transform", function(d, i) {
			return "translate(" + (i * (b.w + b.s)+70) + ", 0)";
		});

		// Remove exiting nodes.
		g.exit().remove();

		// Now move and update the percentage at the end.
		d3.select("#trail").select("#endlabel")
			.attr("x", (nodeArray.length + 0.5) * (b.w + b.s)-10+70)
			.attr("y", b.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.text(percentageString);

		// Make the breadcrumb trail visible, if it's hidden.
		d3.select("#trail")
			.style("visibility", "");

		d3.select("#trail").select("#front-text")
			// .attr("x", (b.w + b.t) / 2)
			.attr("x", 30)
			.attr("y", b.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.style("fill", "#000")
			.text("Selected:");
	}

	function drawLegend() {
		// Dimensions of legend item: width, height, spacing, radius of rounded rect.
		var li = {
			w: 80, h: 30, s: 3, r: 3
		};

		var colorsLegend = {
			"Age": "#039BE5",
			"Driver/Rider": "#FFA000",
			"Passenger": "#FF8F00",
			"Pedestrian": "#EF6C00",
			"Minor": "#F06461",
			"Serious": "#E53935",
			"Fatal": "#B71C1C"
		};

		var legend = d3.select("#legend").append("svg:svg")
			.attr("width", (li.w+li.s) * (d3.keys(colorsLegend).length))
			// .attr("height", d3.keys(colorsLegend).length * (li.h + li.s));
			.attr("height", li.h);

		var g = legend.selectAll("g")
			.data(d3.entries(colorsLegend))
			.enter().append("svg:g")
			.attr("transform", function(d, i) {
				// return "translate(0," + i * (li.h + li.s) + ")";
				return "translate("+i * (li.w + li.s) + ",0)";
			});

		g.append("svg:rect")
			.attr("rx", li.r)
			.attr("ry", li.r)
			.attr("width", li.w)
			.attr("height", li.h)
			.style("fill", function(d) { return d.value; });

		g.append("svg:text")
			.attr("x", li.w / 2)
			.attr("y", li.h / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.text(function(d) { return d.key; });
	}

	// Take a 2-column CSV and transform it into a hierarchical structure suitable
	// for a partition layout. The first column is a sequence of step names, from
	// root to leaf, separated by hyphens. The second column is a count of how 
	// often that sequence occurred.
	function buildHierarchy(csv) {
		var root = {"name": "root", "children": []};
		for (var i = 0; i < csv.length; i++) {
			var sequence = csv[i][0];
			var size = +csv[i][1];
			if (isNaN(size)) { // e.g. if this is a header row
				continue;
			}
			var parts = sequence.split("-");
			var currentNode = root;
			for (var j = 0; j < parts.length; j++) {
				var children = currentNode["children"];
				var nodeName = parts[j];
				var childNode;
				if (j + 1 < parts.length) {
					// Not yet at the end of the sequence; move down the tree.
					var foundChild = false;
					for (var k = 0; k < children.length; k++) {
						if (children[k]["name"] == nodeName) {
							childNode = children[k];
							foundChild = true;
							break;
						}
					}
					// If we don't already have a child node for this branch, create it.
					if (!foundChild) {
						childNode = {"name": nodeName, "children": []};
						children.push(childNode);
					}
					currentNode = childNode;
				} else {
					// Reached the end of the sequence; create a leaf node.
					childNode = {"name": nodeName, "size": size};
					children.push(childNode);
				}
			}
		}
		return root;
	}

	function resetVisualisation() {
		onClickStatus = false;
		casualtyAgeBinDim.filterAll();
		casualtyClassDim.filterAll();
		casualtySeverityDim.filterAll();
		var filteredResult = casualtyAgeBinDim.top(Infinity);

		rbUpdate(filteredResult);
		initDriversHistogram(filteredResult, false);
		initDayofWeekBarChart(filteredResult, false);
		initWeatherCondition(filteredResult, false);
		initRoadSurfaceCondition(filteredResult, false);

		var g = d3.select('.sunburst-chart');
		// Hide the breadcrumb trail  
		g.select("#trail").style("visibility","hidden");
		g.select("#select-msg").style("visibility","visible");
	}
}

function rbUpdate(preData) {
	var rbData = null,
	keys = ['12AM', '01AM', '02AM', '03AM', '04AM', '05AM', '06AM', '07AM', '08AM', '09AM', '10AM', '11AM',
			'12PM', '01PM', '02PM', '03PM', '04PM', '05PM', '06PM', '07PM', '08PM', '09PM', '10PM', '11PM'];
	
	var chart = radialBarChart()
		.reverseLayerOrder(true)
		.capitalizeLabels(true)
		.barColors(['#4F617B']);

	initData();

	function initData() {
		preData = d3.nest()
			.key(function(d) { return d.time; })
			.key(function(d) { return d.Accident_Index; })
			.rollup(function(v) { return v.length; })
			.entries(preData);


		var total = d3.sum(preData, function(d) { 
			return d.values.length; 
		});

		preData.forEach(function(d) {
			d.percentage = parseFloat((d.values.length / total * 100).toFixed(2));
		});

		rbData = [{data: {}}];
		for (var i = 0; i < keys.length; i++) {
			var notInsert = true;
			preData.forEach(function(p) {
				if (p.key === (keys[i])) {
					rbData[0].data[keys[i]] = p.percentage;
					notInsert = false;
				}
			});
			if (notInsert) {
				rbData[0].data[keys[i]] = 0;
			}
		};

		d3.select('#rb-chart')
			.datum(rbData)
			.call(chart);
	}
}

function radialBarChart() {
	// Configurable variables
	var margin = {top: 10, right: 10, bottom: 10, left: 10};
	var barHeight = 90;
	var reverseLayerOrder = false;
	var barColors = undefined;
	var capitalizeLabels = false;
	var domain = [0, 100];
	var tickValues = [];
	var colorLabels = false;
	var tickCircleValues = [];
	var transitionDuration = 750;

	// Scales & other useful things
	var numBars = null;
	var barScale = null;
	var keys = null;
	var labelRadius = 0;
	var ir = barHeight/2; // center hole
	var tickHeight = 3;

	function init(d) {
		// customized ticks
		var values = d3.map(d[0].data).values();
		var max = 0;
		for (var i = 0; i < values.length; i++) {
			if (max < values[i]) {
				max = values[i];
			}
		}

		max = Math.ceil(max);
		while (max % 3 != 0) {
			max++;
		}

		domain = [0,max];

		tickValues.push();
		for (var i = 1; i <= 3; i++) {
			tickValues.push(max/3*i);
		}

		tickCircleValues = tickValues.slice(0,-1);

		// chart codes
		barScale = d3.scale.linear().domain(domain).range([ir, barHeight]);

		keys = d3.map(d[0].data).keys();
		numBars = keys.length;

		// Radius of the key labels
		labelRadius = ir / 1.4;
	}

	function svgRotate(a) {
		return 'rotate('+ +a +')';
	}

	function svgTranslate(x, y) {
		return 'translate('+ +x +','+ +y +')';
	}

	function initChart(container) {
		var g = d3.select(container)
			.append('svg')
			.classed('radial-barchart-svg', true)
			.style('width', 2 * barHeight + margin.left + margin.right + 'px')
			.style('height', 2 * barHeight + margin.top + margin.bottom + 'px')
			.append('g')
			.classed('radial-barchart', true)
			.attr('transform', svgTranslate(margin.left + barHeight, margin.top + barHeight));

		// Concentric circles at specified tick values
		g.append('g')
			.classed('tick-circles', true)
			.selectAll('circle')
			.data(tickCircleValues)
			.enter()
			.append('circle')
			.attr('r', function(d) {return barScale(d);})
			.style('fill', 'none');
	}

	function renderOverlays(container, update) {
		var g = d3.select(container).select('svg g.radial-barchart');

		// Spokes
		g.append('g')
			.classed('spokes', true)
			.selectAll('line')
			.data(keys)
			.enter()
			.append('line')
			.attr('y1', -ir+tickHeight)
			.attr('y2', -ir)
			.attr('transform', function(d, i) {return svgRotate(i * 360 / numBars);});

		// Axis Part 1
		var axisScale = d3.scale.linear().domain(domain).range([-ir, -barHeight]);
		var axis = d3.svg.axis().scale(axisScale).orient('right');
		if(tickValues) {
			axis.tickValues(tickValues);
			axis.tickFormat(function(d) { return d + "%"; });
			axis.tickSize(0,0);
			axis.tickPadding(0);
		}

		// Outer circle
		if (update) {
			g.insert('g', '.layer')
				.classed('axis', true)
				.call(axis);

			g.insert('circle', '.axis')
				.attr('r', barHeight)
				.classed('outer', true)
				.style('fill', 'none');
		} else {
			g.append('circle')
				.attr('r', barHeight)
				.classed('outer', true)
				.style('fill', 'none');
		}

		// Axis Part 2
		if (!update) {
			g.append('g')
				.classed('axis', true)
				.call(axis);
		}

		g.selectAll(".tick text")
			.style("fill", "#333")
			.style('text-anchor', 'middle');

		g.selectAll(".tick")
			.data(tickValues)
			.insert("rect","text")
			.attr("x", -18)
			.attr("y", -10)
			.attr("width", "36")
			.attr("height", "20")
			.style("fill", "#FFF");

		// Labels
		var labels = g.append('g')
			.classed('labels', true);

		var labelText = ['12AM','6AM','12PM','6PM'];

		labels.append('text')
			.attr("y", -labelRadius/1.03)
			.attr("x", 0)
			.attr('text-anchor', 'middle')
			.text(labelText[0]);

		labels.append('text')
			.attr("y", labelRadius/10)
			.attr("x", labelRadius/1.08)
			.attr('text-anchor', 'middle')
			.text(labelText[1]);

		labels.append('text')
			.attr("y", labelRadius*1.18)
			.attr("x", 0)
			.attr('text-anchor', 'middle')
			.text(labelText[2]);

		labels.append('text')
			.attr("y", labelRadius/10)
			.attr("x", -labelRadius/1.08)
			.attr('text-anchor', 'middle')
			.text(labelText[3]);
	}

	function chart(selection) {		
		selection.each(function(d) {
			init(d);

			if(reverseLayerOrder)
				d.reverse();

			var g = d3.select(this).select('svg g.radial-barchart');
			g.selectAll("g > .spokes").remove();
			g.selectAll("g > .outer").remove();
			g.selectAll("g > .axis").remove();
			g.selectAll("g > .labels").remove();

			// check whether chart has already been created
			var update = g[0][0] !== null; // true if data is being updated

			if(!update)
				initChart(this);

			g = d3.select(this).select('svg g.radial-barchart');

			// if(!update)
				renderOverlays(this, update);

			// Layer enter/exit/update
			var layers = g.selectAll('g.layer')
				.data(d);

			layers
				.enter()
				.append('g')
				.attr('class', function(d, i) {
					return 'layer-' + i; })
				.classed('layer', true);

			layers.exit().remove();

			var tipText = ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
			'12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM','12AM'];

			var tooltip =
				d3.select('#rb-chart').append('div')
				.attr('class', 'rb-chart-tooltip');

			tooltip.append('div')
				.attr('class', 'label');

			tooltip.append('div')
				.attr('class', 'percent');


			// Segment enter/exit/update
			var segments = layers
				.selectAll('path')
				.data(function(d) {
					var m = d3.map(d.data);
					return m.values(); 
				});
			
			segments
				.enter()
				.append('path')
				.style('stroke', '#FFF')
				.style('stroke-width', 0.5)
				.style('fill', function(d, i) {
					if(!barColors) return;
						return barColors[i % barColors.length];
				})
				.on("mouseover", function(d, i) {
					tooltip.select('.label').html(tipText[i] + " to " + tipText[i+1]);
					tooltip.select('.percent').html(d + '% of Accidents');
					tooltip.style('display', 'block');

					g.selectAll("path")
						.style("fill", "#CAD0D7");

					d3.select(this)
						.style("fill", "#4F617B");
				})
				.on("mouseout", function(d) {
					tooltip.style('display', 'none');

					g.selectAll("path")
						.style("fill", "#4F617B");
				});
			
			segments.exit().remove();

			segments
				.transition()
				.duration(transitionDuration)
				.attr('d', d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea));

			if(!update) {
				g.append('circle')
					.attr('r', ir)
					.style('stroke', '#000')
					.style('stroke-width', 0.5)
					.style('fill', 'none');
			}
		});
	}

	/* Arc functions */
	or = function(d, i) {
		return barScale(d);
	}
	sa = function(d, i) {	
		return (i * 2 * Math.PI) / numBars;
	}
	ea = function(d, i) {
		return ((i + 1) * 2 * Math.PI) / numBars;
	}

	/* Configuration getters/setters */
	chart.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return chart;
	};

	chart.barHeight = function(_) {
		if (!arguments.length) return barHeight;
		barHeight = _;
		return chart;
	};

	chart.reverseLayerOrder = function(_) {
		if (!arguments.length) return reverseLayerOrder;
		reverseLayerOrder = _;
		return chart;
	};

	chart.barColors = function(_) {
		if (!arguments.length) return barColors;
		barColors = _;
		return chart;
	};

	chart.capitalizeLabels = function(_) {
		if (!arguments.length) return capitalizeLabels;
		capitalizeLabels = _;
		return chart;
	};

	chart.domain = function(_) {
		if (!arguments.length) return domain;
		domain = _;
		return chart;
	};

	chart.tickValues = function(_) {
		if (!arguments.length) return tickValues;
		tickValues = _;
		return chart;
	};

	chart.colorLabels = function(_) {
		if (!arguments.length) return colorLabels;
		colorLabels = _;
		return chart;
	};

	chart.tickCircleValues = function(_) {
		if (!arguments.length) return tickCircleValues;
		tickCircleValues = _;
		return chart;
	};

	chart.transitionDuration = function(_) {
		if (!arguments.length) return transitionDuration;
		transitionDuration = _;
		return chart; 
	};

	return chart;
}

function initDriversHistogram(preData, newCreate) {
	// process data
	var ageOfDriver = 0,
	binSize = 10,
	maxBin = 90;

	preData.forEach(function(d) {
		ageOfDriver = d.Age_of_Driver;
		if (ageOfDriver != -1) {
			d.ageBin = Math.floor(ageOfDriver/binSize)*binSize;
		}
	});

	preData = d3.nest()
		.key(function(d) { return d.ageBin; })
		.key(function(d) { return d.Accident_Index; })
		.rollup(function(v) { return v.length; })
		.entries(preData);

	var data = [];
	for (var i=0; i < (100/binSize); i++) {
		var binValue = i * binSize;
		var added = true;
		for (var j=0; j<preData.length; j++) {
			if (preData[j].key == binValue) {
				data.push({"x": binValue, "y": preData[j].values.length});
				added = false;
			}
		}
		if (added) {
			data.push({"x": binValue, "y": 0});
		}
	}

	// create histogram
	createHistogram(data, maxBin, binSize);

	function createHistogram (data, maxBin, binInc) {
		// A formatter for counts
		var formatCount = d3.format(",.0f");
		var totalWidth = 600;
		var totalHeight = 150;
		var margin = {top: 15, right: 10, bottom: 50, left: 60},
		width = totalWidth - margin.left - margin.right,
		height = totalHeight - margin.top - margin.bottom;

		var binArray = [];
		for (var i = 0; i <= maxBin + binInc; i += binInc) {
			binArray.push(i);
		}
		var binTicks = [];
		for (var i = 0; i < maxBin + binInc; i += binInc) {
			binTicks.push(i);
		}
		binTicks.push(100);

		var x = d3.scale.linear()
			.domain([0, maxBin + binInc])
			.range([0, width]);
		var binWidth = parseFloat(width / (binArray.length - 1)) - 1;

		var y = d3.scale.linear()
			.domain([0, d3.max(data, function(d) { return d.y; })])
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickValues(binTicks);

		var yAxis = d3.svg.axis()
			.ticks(5)
			.scale(y)
			.orient("left");

		if (newCreate) {
			var svg = d3.select("#histogram").append("svg")
				.classed('histogram', true)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom-10)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var bar = svg.selectAll(".bar")
				.data(data)
				.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.x); })
				.attr("width", binWidth)
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis);
			  
			// Add axis labels
			svg.append("text")
				.attr("class", "x label")
				.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 15) + ")")
				.attr("text-anchor", "middle")
				.text("Driver's Age");
			  
			svg.append("text")
				.attr("class", "y label")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				.attr("x", 0 - (height / 2))
				.attr("dy", "1em")
				.attr("text-anchor", "middle")
				.text("No. of Accidents");
		} else {
			var svg = d3.select("#histogram").select(".histogram");
			var bar = svg.selectAll(".bar").data(data);
			
			bar.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.x); })
				.attr("width", binWidth)
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 10;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity",1 );

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});

			// removed data:	
			bar.exit().remove();
			bar.transition().duration(750)  // <<< added this
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); });
			// updated data:
			// "x" and "width" will already be set from when the data was
			// first added from "enter()".
		
			svg.select(".y.axis").transition().delay(500).call(yAxis);
		}
	}
}

function initDayofWeekBarChart(preData, newCreate){
	// process data
	var labelArray = ["Mon","Tues","Wed","Thur","Fri","Sat","Sun"];

	preData = d3.nest()
		.key(function(d) { return d.Day_of_Week; })
		.key(function(d) { return d.Accident_Index; })
		.rollup(function(v) { return v.length; })
		.entries(preData);

	var data = [];
	for (var i=0; i < labelArray.length; i++) {
		var added = true;
		for (var j=0; j<preData.length; j++) {
			if (preData[j].key == labelArray[i]) {
				data.push({"x": labelArray[i], "y": preData[j].values.length});
				added = false;
			}
		}
		if (added) {
			data.push({"x": labelArray[i], "y": 0});
		}
	}

	// create bar
	updateBar(data);

	function updateBar(data) {
		var margin = {top: 15, right: 10, bottom: 50, left: 60},
		totalWidth = 310,
		totalHeight = 210,
		width = totalWidth - margin.left - margin.right,
		height = totalHeight - margin.top - margin.bottom;

		var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
		var y = d3.scale.linear().range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.tickSize(0)
			.tickPadding(5)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5);

		if (newCreate) {
			var svg = d3.select("#dayofweekbarchart").append("svg")
				.classed('dowbarchart', true)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", 
					"translate(" + margin.left + "," + margin.top + ")");

			x.domain(data.map(function(d) { return d.x; }));
			y.domain([0, d3.max(data, function(d) { return d.y; })]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll("text")
				.style("text-anchor", "middle");

			svg.append("text")
				.attr("class", "x label")
				.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 20) + ")")
				.attr("text-anchor", "middle")
				.text("Day of Week");

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left+5)
				.attr("x", 0 - (height / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text("No. of Accidents");

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class",'bar')
				.attr("x", function(d) { return x(d.x); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});
		} else {
			var svg = d3.select("#dayofweekbarchart").select('.dowbarchart');

			x.domain(data.map(function(d) { return d.x; }));
			y.domain([0, d3.max(data, function(d) { return d.y; })]);

			var bar = svg.selectAll(".bar").data(data)
			bar.enter().append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});

			bar.exit().remove();
			bar.transition().duration(750)  // <<< added this
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); });
			// updated data:
			// "x" and "width" will already be set from when the data was
			// first added from "enter()".

			svg.select(".y.axis").transition().delay(500).call(yAxis);
		}		
	}
}

function initWeatherCondition(preData, newCreate){
	// process data
	var labelArray = ["Fine","Fine & Windy","Fog/ Mist","Rain","Rain & Windy","Snow","Snow & Windy"];

	preData = d3.nest()
		.key(function(d) { return d.Weather_Conditions; })
		.key(function(d) { return d.Accident_Index; })
		.rollup(function(v) { return v.length; })
		.entries(preData);

	var data = [];
	for (var i=0; i < labelArray.length; i++) {
		var added = true;
		for (var j=0; j<preData.length; j++) {
			if (preData[j].key == labelArray[i]) {
				data.push({"x": labelArray[i], "y": preData[j].values.length});
				added = false;
			}
		}
		if (added) {
			data.push({"x": labelArray[i], "y": 0});
		}
	}

	// create bar
	updateBar(data);

	function updateBar(data) {
		var margin = {top: 15, right: 10, bottom: 50, left: 60},
		totalWidth = 310,
		totalHeight = 205,
		width = totalWidth - margin.left - margin.right,
		height = totalHeight - margin.top - margin.bottom;

		var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
		var y = d3.scale.linear().range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.tickSize(0)
			.tickPadding(5)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5);

		if (newCreate) {
			var svg = d3.select("#weatherconditionchart").append("svg")
				.classed('wconditionchart', true)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", 
					"translate(" + margin.left + "," + margin.top + ")");

			x.domain(data.map(function(d) { return d.x; }));
			y.domain([0, d3.max(data, function(d) { return d.y; })]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll("text")
				.call(wrap, x.rangeBand())
				.style("text-anchor", "middle");

			svg.append("text")
				.attr("class", "x label")
				.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 12) + ")")
				.attr("text-anchor", "middle")
				.style("font-size","11px")
				.text("Weather Condition");

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left+5)
				.attr("x", 0 - (height / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text("No. of Accidents");

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class",'bar')
				.attr("x", function(d) { return x(d.x); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});
		} else {
			var svg = d3.select("#weatherconditionchart").select('.wconditionchart');

			x.domain(data.map(function(d) { return d.x; }));
			y.domain([0, d3.max(data, function(d) { return d.y; })]);

			var bar = svg.selectAll(".bar").data(data)
			bar.enter().append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});

			bar.exit().remove();
			bar.transition().duration(750)  // <<< added this
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); });

			svg.select(".y.axis").transition().delay(500).call(yAxis);
		}
	}
}

function initRoadSurfaceCondition(preData, newCreate){
	// process data
	var ageOfDriver = 0,
	binSize = 10,
	maxBin = 90;
	
	var labelArray = ["Dry","Wet/ Damp","Flood","Frost/ Ice","Snow"];

	preData = d3.nest()
		.key(function(d) { return d.Road_Surface_Conditions; })
		.key(function(d) { return d.Accident_Index; })
		.rollup(function(v) { return v.length; })
		.entries(preData);

	var data = [];
	for (var i=0; i < labelArray.length; i++) {
		var added = true;
		for (var j=0; j<preData.length; j++) {
			if (preData[j].key == labelArray[i]) {
				data.push({"x": labelArray[i], "y": preData[j].values.length});
				added = false;
			}
		}
		if (added) {
			data.push({"x": labelArray[i], "y": 0});
		}
	}

	// create bar
	updateBar(data);

	function updateBar(data) {
		var margin = {top: 15, right: 10, bottom: 50, left: 60},
		totalWidth = 310,
		totalHeight = 205,
		width = totalWidth - margin.left - margin.right,
		height = totalHeight - margin.top - margin.bottom;

		var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
		var y = d3.scale.linear().range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.tickSize(0)
			.tickPadding(5)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5);

		if (newCreate) {
			var svg = d3.select("#roadsurfaceconditionchart").append("svg")
				.classed('rsconditionchart',true)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", 
					"translate(" + margin.left + "," + margin.top + ")");

			x.domain(data.map(function(d) { return d.x; }));
			y.domain([0, d3.max(data, function(d) { return d.y; })]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll("text")
				.call(wrap, x.rangeBand())
				.style("text-anchor", "middle");

			svg.append("text")
				.attr("class", "x label")
				.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 12) + ")")
				.attr("text-anchor", "middle")
				.style("font-size","11px")
				.text("Road Surface Condition");

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left+5)
				.attr("x", 0 - (height / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text("No. of Accidents");

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class",'bar')
				.attr("x", function(d) { return x(d.x); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});
		} else {
			var svg = d3.select("#roadsurfaceconditionchart").select('.rsconditionchart');
			
			x.domain(data.map(function(d) { return d.x; }));
			y.domain([0, d3.max(data, function(d) { return d.y; })]);

			var bar = svg.selectAll(".bar").data(data)
			bar.enter().append("rect")
				.attr("x", function(d) { return x(d.x); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); })
				.on("mouseover", function(d) {
					var barWidth = parseFloat(d3.select(this).attr("width"));
					var xPosition = parseFloat(d3.select(this).attr("x")) + (barWidth / 2);
					var yPosition = parseFloat(d3.select(this).attr("y")) - 5;

					svg.append("text")
						.attr("id", "tooltip")
						.attr("x", xPosition)
						.attr("y", yPosition)
						.attr("text-anchor", "middle")
						.text(addCommas(""+d.y));

					svg.selectAll("rect")
						.style("opacity", 0.3);

					d3.select(this)
						.style("opacity", 1);

				})
				.on("mouseout", function(d) {
					d3.select('#tooltip').remove();

					svg.selectAll("rect")
						.style("opacity", 1);
				});

			bar.exit().remove();
			bar.transition().duration(750)  // <<< added this
				.attr("y", function(d) { return y(d.y); })
				.attr("height", function(d) { return height - y(d.y); });

			svg.select(".y.axis").transition().delay(500).call(yAxis);
		}
	}
}

function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function wrap(text, width) {
	text.each(function() {
		var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.1, // ems
		y = text.attr("y"),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if ((tspan.node().getComputedTextLength() > width) || word == "Ice") {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}