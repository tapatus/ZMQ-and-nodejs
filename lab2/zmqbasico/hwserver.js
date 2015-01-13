/*------------------------Para probar, ejecute este comando-------------------
node hwserver.js 5555 1 todo muy bien
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Puerto, segundos, mensaje');
    process.exit();
}

var zmq = require('zmq'),
    i,
    se = args[2], //port
    ns = args[3] * 1000, //numero de segundo a esperar
    te = args[4]; //texto respuesta

    for (i = 5; i < args.length; i++) { //si texto es mas de 1 palabra
        te +=" " + args[i];
    }


// socket to talk to clients
var responder = zmq.socket('rep');

responder.on('message', function(request) {
    console.log("Received request: [", request.toString(), "]");

    // do some 'work'
    setTimeout(function() {
        // send reply back to client.
        responder.send(request.toString() + ' ' + te);
    }, ns);
});

responder.bind('tcp://*:'+se, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening " + se + "...");
  }
});

process.on('SIGINT', function() {
    responder.close();
});
