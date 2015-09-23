var imported = document.createElement('script');
imported.src = 'js/snake.js';

var ws1 = new WebSocket("ws://mlha-139.sin.cvut.cz:1337/servers/00000001/events?topic=200%2F20202066%2Fstate");
var page = 1;
document.head.appendChild(imported);

ws1.onmessage = function(evt) {
	var dt = JSON.parse(evt.data).data;
	if(dt == 1) {
		console.log("TO THE DUMMY");
		window.location.assign("counter.html");
	}
}