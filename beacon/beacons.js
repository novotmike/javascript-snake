var people = [];
var beacons=init_beacons(people);

function refresh(type){
  //console.log(Object.keys(people));
  var textOUT1 = document.getElementById("header1");
  textOUT1.innerHTML="";
  Object.keys(people).forEach(function(email){
    var person=people[email];

    last0=1000;
    last1=1000;
    prelast0=1000;
    prelast1=1000;


    person.beacon[0].packets.forEach(function(packet,index,array){
      //textOUT1.innerHTML+=packet.rssi+" "+packet.distance+" "+packet.distanceCalculated+" "+packet.timestamp+"<br>";

      if(index==array.length-2)prelast0=packet.distanceCalculated;
      if(index==array.length-1)last0=packet.distanceCalculated;
    });
    textOUT1.innerHTML+="------------------<br>";
    person.beacon[1].packets.forEach(function(packet,index,array){
      //textOUT1.innerHTML+=packet.rssi+" "+packet.distance+" "+packet.distanceCalculated+" "+packet.timestamp+"<br>";
      if(index==array.length-2)prelast1=packet.distanceCalculated;
      if(index==array.length-1)last1=packet.distanceCalculated;
    });
    person.position=parseFloat((last0/(last0+last1)).toFixed(3));

    var b0=(prelast0+last0)/2;
    var b1=(prelast1+last1)/2;

    person.positionAVG=parseFloat((((b0/(b0+b1))+person.position)/2).toFixed(3));
    /*textOUT1.innerHTML+="============================<br>";
    document.getElementById("header2").innerHTML=person.position;
    document.getElementById("header3").innerHTML=;*/
    textOUT1.innerHTML+=email+" "+person.positionAVG+"<br>";
  });

}


setInterval(function(){
  refresh();
},100);
