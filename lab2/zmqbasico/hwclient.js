/*------------------------Para probar, ejecute este comando-------------------
node hwclient.js localhost:5555 10 que pasa por aqui
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Endpoint_de_servidor, nr_peticiones, mensaje');
    process.exit();
}

var zmq = require('zmq'),
    i,
    se = args[2], //server endpoint
    np = args[3], //numero de peticiones a enviar
    te = args[4]; //texto peticion

    for (i = 5; i < args.length; i++) { //si texto es mas de 1 palabra
        te +=" " + args[i];
    }

// socket to talk to server
console.log("Connecting to hello world server...");
var requester = zmq.socket('req');
var x = 0;
requester.on("message", function(reply) {
  console.log("Received reply", x, ": [", reply.toString(), ']');
  x += 1;
  if (x === 10) {
    requester.close();
    process.exit(0);
  }
});

requester.connect('tcp://' + se);

for (i = 0; i < np; i++) {
  console.log("Sending request", i, '...');
  requester.send(te);
}

process.on('SIGINT', function() {
  Requester.close();
});
