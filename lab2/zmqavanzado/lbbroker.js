/*------------------------Para probar, ejecute este comando-------------------
node rrbroker.js 5555 5556
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Puerto frontend, puerto backend, modo verbose');
    process.exit();
}

var zmq      = require('zmq'),
    frontend = zmq.socket('router'),
    backend  = zmq.socket('router'),
    pr = args[2], //puerto frontend
    pd = args[3], //puerto backend
    bul = args[4], //modo verbose

    workers = [], //array de pares [worker_id trabajos_hechos] 
    wi = 0, //indice de workers
    clients = []; //array de clientes 

frontend.bindSync('tcp://*:' + pr);
backend.bindSync('tcp://*:' + pd);
console.log('Frontend en puerto ' + pr);
console.log('Backend en puerto ' + pd);

frontend.on('message', function() {
    var args = Array.apply(null, arguments),
        enw = buscaworker(),
        id = args[0].toString(),
        te = args[2].toString();
    
    bul ? verb('r', id, te, args) : 0;
    if (enw !== null) {
        args.unshift('');
        args.unshift(enw);
        workers[enw].disp = 'ocupado';

        bul ? verb('s', args[2], args[0]) : 0;
        backend.send(args);
    }
    else {
        //encolar();
    }
});

backend.on('message', function() {
    var args = Array.apply(null, arguments);
    
    if (args[4] && args[4].toString() === 'ok') {
        bul ? verb('sr', args[0], args[4], args) : 0;
        workers[args[0]].disp = 'ready';
        args = args.slice(2); printa(args);
        frontend.send(args);
    }
    
    else if (!estaya(args[0].toString())) {
        bul ? verb('rw', args[0], args[2], args) : 0;
        workers[args[0].toString()] = {
                disp : args[2].toString(),
                jobs : 0,
            };
    }
});


//------------------------helper functions------------------------
function printa (a) {
    a.map(function (a, i) {
        console.log('\t Parte ' + i + ': ' + a.toString()); 
    });
}
function estaya (a) {
    for (var i in workers) {
        if (workers[i] === a){
            return true;
        }
    }
    return false;
}

function buscaworker () {
    var w = null,
        minjobs = 99999; // un maximo 
    for (var i in workers) {
        if (workers[i].disp === 'ready' && workers[i].jobs < minjobs) {
            w = i;
        }
    }
    return w;
}

function verb (a, b, c, args) {
    switch (a) {
    case 'r' :
        console.log('Request de cliente -> ' + b + ' con texto -> ' + c);
        printa(args);
        break;
    case 's' :
        console.log('Enviando peticion de cliente -> ' + b + ' al worker -> ' + c + ' usando el backend')
        break;
    case 'sr' :
        console.log('Request de worker -> ' + b + ' con texto -> ' + c);
        printa(args);
        console.log('Enviando respuesta de worker -> ' + b + ' al cliente -> ' + c + ' usando el frontend')
        break;
    case 'rw' :
        console.log('Request de worker -> ' + b + ' con texto -> ' + c);
        printa(args);
    };
}
