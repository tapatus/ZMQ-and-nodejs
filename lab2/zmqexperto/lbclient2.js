

var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Endpoint_de_router, nr_peticiones, mensaje');
    process.exit();
}
var zmq       = require('zmq'),
    requester = zmq.socket('req'),
    makeReq = makeSender(requester),
    re = args[2], //router endpoint
    id = args[3], //identificacin
    te = args[4]; //texto peticion

requester.identity = id;
requester.connect('tcp://' + re);
console.log('El cliente ' + id + ' conectado a tcp:// ' + re);
// requester.on('message', function(msg) {
//     console.log('Cliente -> ' + id + ' ha recibido respuesta ' + msg.toString());
//     requester.close();
//     process.exit(0); 
// });
console.log('Cliente -> ' + id + ' envia el mensaje -> ' + te);
// requester.send(te);
makeReq(te).then(function (msg) {
    console.log('Cliente -> ' + id + ' ha recibido respuesta ' + msg.toString());
    // console.log("Cia socket requester " + requester);
    // console.log('Cia socket reqsock' + this.reqsock);
    // console.log('ar jie lygus' + (requester === this.reqsock));
    this.reqsock.close();
    process.exit(0); 
});

//helper functions
function makeSender (reqsock) {
    var Promise = require('bluebird'),
        promises = [];

    reqsock.on('message', function (reply) {
        promises.shift().resolve(reply);
    });
    reqsock.on('error', function(reason) {
        promises.shift().reject(reason);
    });

   return function (message) {
        return new Promise(function (resolve, reject) {
            promises.push({resolve: resolve, reject: reject});
            reqsock.send(message);
            //mas generico, no tenemos que cerrar el socket usando su ref del scope global
            this.reqsock = reqsock;
        });
    };
}

