/*------------------------Para probar, ejecute este comando-------------------
node rrworker.js localhost:5556 1 I am worker one/two
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 7) {
    console.log('Endpoint, indentificacion, text_disponibilidad, texto_atencion, modo_verbose');
    process.exit();
}
var zmq = require('zmq'),
    responder = zmq.socket('req'),
    be = args[2], //endpoint de router backend
    id = args[3], //identificacion de worker
    td = args[4], //texto de disponibilidad
    ta = args[5], //texto de atencion
    bul = args[6], //boolean modo verbose
    jobs = 0;


responder.identity = id;
responder.connect('tcp://' + be);
console.log('El worker ' + id + ' ha enviado el primero mensaje -> ready')
responder.send('ready'); //para darse de alta, decir q es disponible
responder.on('message', function(msg) {
    var args = Array.apply(null, arguments);
    (bul === 'true') ? verb('r', args) : 0;
    //hacer trabajo y al acabar notificar broker
    jobs += 1;
    args[2] = 'ok';
    (bul === 'true') ? verb('s') : 0;
    responder.send(args); 
});

setTimeout(function () {
    responder.close();
    process.exit;
},60000);

//------------------------helper functions------------------------
function printa (a) {
    a.map(function (a, i) {
        console.log('\t Parte ' + i + ': ' + a.toString()); 
    });
}
function verb (a, args) {
    if (a === 's') {
        console.log('El worker -> ' + id + ' ya lleva ' + jobs + ' trabajos: ');
    }
    else if ('r') {
        console.log('El worker -> ' + id + ' ha recibido trabajo del cliente -> ' + args[0]);
    }
}
