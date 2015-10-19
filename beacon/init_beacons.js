var funct = function(evt,id){
  var timestamp = JSON.parse(evt.data).timestamp;
  var payload = JSON.parse(JSON.parse(evt.data).data);

  if(people[payload.email]===undefined){
    people[payload.email]=new Object();
    people[payload.email].beacon=[];
    people[payload.email].positions=[]
    people[payload.email].photo=new Image();
    people[payload.email].photo.src=gravatar("valacpav@fel.cvut.cz");
  }
  if(people[payload.email].beacon[id]===undefined){
    people[payload.email].beacon[0]=new Object();
    people[payload.email].beacon[0].packets=[];
    people[payload.email].beacon[0].valid=false;
    people[payload.email].beacon[1]=new Object();
    people[payload.email].beacon[1].packets=[];
    people[payload.email].beacon[1].valid=false;
  }

  var rom=-58; //rssi at one metre
  var p=3.2; //propagation constant


  //push and shift
  var packet = new Object();
  packet.rssi=payload.rssi;
  packet.distance=parseFloat(payload.distance.toFixed(2));
  packet.distanceCalculated=parseFloat(Math.pow(10,(payload.rssi-rom)/(-10*p)).toFixed(2));
  packet.timestamp=timestamp;

  people[payload.email].beacon[id].packets.push(packet);
  //refresh();
}

function filter_packets(people,timestamp,id,millisec){
  Object.keys(people).forEach(function(email){
    people[email].beacon[id].packets=people[email].beacon[id].packets.filter(function(element,index,array){
        return element.timestamp>(timestamp-millisec);
    });
  });
}

function init_beacons(people){
  //dveře C91C52361A4E
  //stoly EF5220BFC1A9

  var beacons = [];
  beacons[0]=new Object();
  beacons[0].id=0;
  beacons[0].name="Beacon u dveri";
  beacons[0].websocket = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000000/events?topic=130%2FC91C52361A4E%2Fdevice");

  beacons[1]=new Object();
  beacons[1].id=1;
  beacons[1].name="Beacon u stolu";
  beacons[1].websocket = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000000/events?topic=130%2FEF5220BFC1A9%2Fdevice");

  pir = new WebSocket("ws://zettor.sin.cvut.cz:1337/servers/00000001/events?topic=129%2F30303003%2Fpir");

  beacons[0].websocket.onmessage = function(event){
      funct(event,0);
  }
  beacons[1].websocket.onmessage = function(event){
      funct(event,1);
  }

  setInterval(function(){
    var millisec = 10000;
    var timestamp = new Date().getTime();
    filter_packets(people,timestamp,0,millisec);
    filter_packets(people,timestamp,1,millisec);
  },1000);

  return beacons;
}
