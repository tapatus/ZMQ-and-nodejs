
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
console.log('El worker ' + id + ' ha enviado el primero mensaje -> ' + td);
responder.send([td,'', getLoad().toString()]); //para darse de alta, decir q es disponible

responder.on('message', function() {
    var args = Array.apply(null, arguments);
    if (args[0] && args[0].toString() === '') {
        console.log('enviamos nuestra carga a peticion temporal del broker ' + args[0].toString());
        responder.send(['', getLoad().toString()]);
    }
    else {
        jobs += 1;
        args[2] = ta;
        args.push('');
        args.push(getLoad());
        (bul === 'true') ? verb('s') : 0;
        console.log('cia mano ' + id + 'carga : ' + getLoad());
        responder.send(args); 
    }
});

setTimeout(function () {
    responder.close();
    process.exit;
},60000);

//------------------------helper functions------------------------

function getLoad () {
    var fs = require('fs'), 
        data = fs.readFileSync("/proc/loadavg"),
        tokens = data.toString().split(' '),
        min1 = parseFloat(tokens[0])+0.01,
        min5 = parseFloat(tokens[1])+0.01,
        min15 = parseFloat(tokens[2])+0.01,
        m = min1*10 + min5*2 + min15;
    return m;
}

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
