var imported = document.createElement('script');
imported.src = 'js/snake.js';

var imported2 = document.createElement('script');
imported2.src = 'js/presence.js';


var ws1 = new WebSocket("ws://mlha-139.sin.cvut.cz:1337/servers/00000001/events?topic=200%2F20202066%2Fstate");
var page = 1;
document.head.appendChild(imported);

ws1.onmessage = function(evt) {
	var dt = JSON.parse(evt.data).data;
	if(dt == 1) {
		page++;
	}
	if(page > 2) {
		page = 1;
	}


	if(page == 1) {
		document.head.removeChild(imported2);
		document.head.appendChild(imported);
	}else {
		var list = document.getElementById(imported);
		document.head.removeChild(list);
		document.head.appendChild(imported2);
	}
	console.log("Page:"+ page);
}