sensorsURL = "http://zettor.sin.cvut.cz:8080/registered_sensors";
sensors=new Array();
prd=undefined;

function cb(str,id,idd){
	var a = JSON.parse(str);
				
	var sensor = a.sensor;
			  
	var temp = a.measured[0];
	var pressure = a.measured[2];
	var vbat = a.measured[4];
			  
	var array= new Array();
	var array1= new Array();
	var array2= new Array();
				
	var ab= new Array();
	var ab1= new Array();
	var ab2= new Array();
	
	/*			
	console.log(temp);
	console.log(pressure);
	console.log(vbat);
	*/		
	
	var resolution = 450000;
	var maxRise = 0.001;
				
	var tmppp = Math.min(temp.items.length,Math.min(pressure.items.length,vbat.items.length));
				
	//merging
	for(var i=0;i<tmppp;i++){
		if(i>0){
			if(Math.abs(temp.items[i].value-temp.items[i-1].value)<(temp.items[i-1].value*maxRise)){
				var k1 = Math.round(new Date(temp.items[i].time).getTime()/resolution);
				if(isNaN(array[k1])){
					array[k1]=0;
					ab[k1]=0;
				}							
				array[k1]+=parseFloat(temp.items[i].value);							
				ab[k1]+=1;
			}
			if(Math.abs(vbat.items[i].value-vbat.items[i-1].value)<(vbat.items[i-1].value*maxRise)){
				var k2 = Math.round(new Date(vbat.items[i].time).getTime()/resolution);
				if(isNaN(array1[k2])){
					array1[k2]=0;
					ab1[k2]=0;
				}
				array1[k2]+=parseFloat(vbat.items[i].value);
				ab1[k2]+=1;
			}
			if(Math.abs(pressure.items[i].value-pressure.items[i-1].value)<(pressure.items[i-1].value*maxRise)){
				var k3 = Math.round(new Date(pressure.items[i].time).getTime()/resolution);
				if(isNaN(array2[k3])){
					array2[k3]=0;
					ab2[k3]=0;
				}
				array2[k3]+=parseFloat(pressure.items[i].value);
				ab2[k3]+=1;
			}
		} else {
			array[Math.round(new Date(temp.items[i].time).getTime()/resolution)]=parseFloat(temp.items[i].value);
			array1[Math.round(new Date(vbat.items[i].time).getTime()/resolution)]=parseFloat(vbat.items[i].value);
			array2[Math.round(new Date(pressure.items[i].time).getTime()/resolution)]=parseFloat(pressure.items[i].value);
			ab[Math.round(new Date(temp.items[i].time).getTime()/resolution)]=1;
			ab1[Math.round(new Date(vbat.items[i].time).getTime()/resolution)]=1;
			ab2[Math.round(new Date(pressure.items[i].time).getTime()/resolution)]=1;
		}					
		
	}
			
				
	var col = new Array();
	var fpcount= 3;
	
	for (var key in array) {
		var c1 = new Array();
		c1.push(new Date(key*resolution));
		c1.push(parseFloat((array[key]/ab[key]).toFixed(fpcount)));
		c1.push(parseFloat((array1[key]/ab1[key]).toFixed(fpcount)));
		c1.push(parseFloat((array2[key]/ab2[key]).toFixed(fpcount)));
		col.push(c1);
	}

	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'date');
	data.addColumn('number', 'Temperature [C]');
	data.addColumn('number', 'Battery [mV]');
	data.addColumn('number', 'Pressure [hPa]');
	data.addRows(col);

				
	var options = {
	  title: 'Thermometer '+sensor.uuid+' '+sensor.description,
	  curveType: 'function',
	  chartArea: {width: '90%', height: '90%'},
	  hAxis: {showTextEvery: 1},
	  vAxes: {
			  0: {logScale: false,
				  showTextEvery: 5,
				  gridlines: {
					//color: '#000000',
					count: 10
				  },
				  viewWindow: {
					max:40,
					min:15
				  }
				 },
			  1: {logScale: false,
				  showTextEvery: 1,
				  viewWindow: {
					max:5100,
					min:3000
				  }
				 },
			  2: {logScale: false,
				  textPosition:'in',
				  showTextEvery: 0
				 }
			 },
	  series:{
		      0:{targetAxisIndex:0},
			  1:{targetAxisIndex:1},
			  2:{targetAxisIndex:2}
			 },
      animation: {
				duration: 2500,
				easing: 'out',
				startup: true
		     },
		     focusTarget: 'category'
	};
	
	chart = new google.visualization.LineChart(document.getElementById(id));
	chart.draw(data, options);
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function httpGetAsync(theUrl, callback){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.send(null);
} 

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function findSensorsByType(type,cb){
	httpGetAsync(sensorsURL,function(response){
		
		JSON.parse(response)._public.forEach(function (sensor){
			if(sensor.type==type){
				sensors[sensor.uuid]=sensor;
				sensor.response="";
				sensor.timestamp=0;
				httpGetAsync(sensorsURL+"/"+sensor.uuid,function(response){
					sensor.response=response;
					sensor.timestamp=new Date().getTime();
					console.log(sensor.uuid,"downloaded");
				});
			}
		});
		cb();
	});
}

window.onresize=function(){
	if(prd!=undefined){
		if(prd[1]!=undefined){
			prd[1]();
		}
		if(prd[2]!=undefined){
			prd[2]();
		}
	}
}

function loadValues(){	
	var comboboxes = document.getElementsByClassName("comboboxes");	
	for(var key in comboboxes){
		if(isNumeric(key)){
			var combo = comboboxes[key];	
			for(var uuid in sensors){
				var sensor = sensors[uuid];
				var option = document.createElement("option");
				option.text = sensor.description+" ("+sensor.uuid+")";
				option.value = sensor.uuid;
				combo.add(option);				
			}
		}
	}
}

function selectedSensor(elementId,uuid){
	var id = elementId.substring(elementId.lastIndexOf(':')+1);
	console.log(id,uuid);
    cb(sensors[uuid].response,'graph'+id);
}

google.load('visualization', '1', {packages: ['corechart']});
findSensorsByType(128,loadValues);
