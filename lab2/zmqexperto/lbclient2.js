/*------------------------Para probar, ejecute este comando-------------------
node rrclient.js localhost:5555 ident1 This is msg
*/

var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Endpoint_de_router, nr_peticiones, mensaje');
    process.exit();
}
var zmq       = require('zmq'),
    requester = zmq.socket('req'),
    re = args[2], //router endpoint
    id = args[3], //identificacin
    te = args[4]; //texto peticion

    for (i = 5; i < args.length; i++) { //si texto peticion es mas de 1 palabra
        te +=" " + args[i];
    }
requester.identity = id;
requester.connect('tcp://' + re);
console.log('El cliente ' + id + ' conectado a tcp:// ' + re);
requester.on('message', function(msg) {
    console.log('Cliente -> ' + id + ' ha recibido respuesta ' + msg.toString());
    requester.close();
    process.exit(0); 
});
console.log('Cliente -> ' + id + ' envia el mensaje -> ' + te);
requester.send(te);

