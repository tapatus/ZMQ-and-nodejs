/*------------------------Para probar, ejecute este comando-------------------
node rrclient.js localhost:5555 10 I am client one/two
*/

var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 4) {
    console.log('Endpoint_de_router, nr_peticiones, mensaje');
    process.exit();
}
var zmq       = require('zmq'),
    requester = zmq.socket('req'),
    re = args[2], //router endpoint
    np = args[3], //numero de peticiones a enviar
    te = args[4] || ' '; //texto peticion

    for (i = 5; i < args.length; i++) { //si texto es mas de 1 palabra
        te +=" " + args[i];
    }

requester.connect('tcp://' + re);
var replyNbr = 0;
requester.on('message', function(msg) {
    console.log('got reply', replyNbr, msg.toString());
    if (replyNbr === np - 1) {
       requester.close();
       process.exit(0); 
    }
    replyNbr++;
});

for (var i = 0; i < np; ++i) {
  requester.send(te);
}

