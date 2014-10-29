var http = require("http");
var ver = 1.2;
console.log("started" + ver);
http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hi v:" + ver);
  response.end();
}).listen(8888);