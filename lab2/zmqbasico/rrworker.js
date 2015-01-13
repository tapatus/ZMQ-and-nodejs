/*------------------------Para probar, ejecute este comando-------------------
node rrworker.js localhost:5556 1 I am worker one/two
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Puerto, segundos, mensaje');
    process.exit();
}
var zmq = require('zmq'),
    responder = zmq.socket('rep'),
    de = args[2], //endpoint de dealer
    ns = args[3] * 1000, //numero de segundo a esperar
    te = args[4]; //texto respuesta

    for (i = 5; i < args.length; i++) { //si texto es mas de 1 palabra
        te +=" " + args[i];
    }

responder.connect('tcp://' + de);
responder.on('message', function(msg) {
  console.log('received request:', msg.toString());
  setTimeout(function() {
    responder.send(te);
  }, ns);
});
