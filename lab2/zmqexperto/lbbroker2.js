
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 5) {
    console.log('Puerto frontend, puerto backend, modo verbose');
    process.exit();
}

var zmq      = require('zmq'),
    frontend = zmq.socket('router'),
    backend  = zmq.socket('router'),
    confsock = zmq.socket('rep'),
    pr = args[2], //puerto frontend
    pd = args[3], //puerto backend
    pc = args[4], //puerto socket para request de configuracion
    bul = args[5], //modo verbose
    cola = [],
    workers = [], //array de pares [worker_id trabajos_hechos],
    tjobs = 0, // total de trabajos que llevan entre todos los trabajadores
    promesa = makeSender(backend),
    confpromesa = makeSender(confsock),
    tim, //el timer, temporizador de la peticion de la carga
    distr = 'lowerLoad', //distribucion 
    adjf = 0, // adjust factor
    per = 200, // periodicity
    llw = 0;// low load workers
/*
el cambio principal es aqui. Tenemos que crear tantas promesas iniciales como workers. En este caso de ejemplo 3.
El worker es un socket req asi que nos hace peticiones a aqui al router del backend. Creando promesas aseguramos
que cuando llegan las peticiones 'ready' del los workers, tengan asociado el handler. Pasamos un zero como para-
metro porque no vamos a enviar nada, es un flag condicional.
*/

promesa(0).then(callback);
promesa(0).then(callback);
promesa(0).then(callback);

confpromesa(0).then(fconfig);

confsock.bind('tcp://*:' + pc);
frontend.bindSync('tcp://*:' + pr);
backend.bindSync('tcp://*:' + pd);
console.log('Frontend en puerto ' + pr);
console.log('Backend en puerto ' + pd);

tim = setInterval(pcarg, per);

frontend.on('message', function() {
    var args = Array.apply(null, arguments),
        id = args[0].toString(),
        enw = buscaworker(),
        te = args[2].toString();
    
    
    (bul === 'true') ? verb('r', id, te, args) : 0;
    if (enw !== null) {
        args.unshift('');
        args.unshift(enw);
        workers[enw].disp = 'ocupado';
        
        (bul === 'true') ? verb('s', null, null, args) : 0;
        promesa(args).then(callback);
    }
    else {
        console.log('no hay quien le atienda ahora');
        cola.push(args);
    }
});



//------------------------helper functions------------------------

function pcarg () { //function que pide carga cada tanto (lo que indica el temporizador )
    console.log('enviando cada ' + per);
    for (var i in workers){
        promesa([i.toString(),'','']).then(callback);
    }
}

function fconfig (a) {
    var args = [].slice.call(a);
    // console.log('cia json arrejus ' + args[0]);
    var ob = JSON.parse(args[0]);
    console.log('cia json distribution ' + ob.distribution);
    if (ob.distribution === 'equitable') {
        clearInterval(tim);
        console.log('ahora busca con equitable');
        distr = ob.distribution;
        adjf = ob.adjustFactor;
    }
    else if (ob.distribution === 'lowerLoad'){
        if (distr === 'equitable') {
            tim = setInterval(pcarg, ob.periodicity);
        }
        distr = ob.distribution;
        per = ob.periodicity;
        llw = ob.lowLoadWorkers;
    }
    confpromesa('Cuando quieras puedes enviar otro!').then(fconfig);
    // console.log('cia json ' + JSON.parse(args[0]));
}
function callback(a) {
    var args = [].slice.call(a),
    cCola = function () {
        var auxargs = cola.pop();
        auxargs.unshift('');
        auxargs.unshift(args[0]);
        console.log('Cogiendo de la cola');
        promesa(auxargs).then(callback);
    };
    
    if (args[4] && args[4].toString() === 'ok') {
        (bul === 'true') ? verb('sr', null, null, args) : 0;
        workers[args[0]].jobs += 1;
        tjobs++;
        console.log('cia carga para OK ' + args[6]);
        workers[args[0]].carga = args[6];
        if (cola.length) {
            cCola();
        }
        else {
            workers[args[0]].disp = 'ready';
        }
        args = args.slice(2);
        //printa(args);
        frontend.send(args);
    }
    
    else if (args[2].toString() === 'ready') {
        (bul === 'true') ? verb('rw', null, null, args) : 0;
        workers[args[0].toString()] = {
            disp : args[2].toString(),
            carga : args[4].toString(),
            jobs : 0
        };
        if (cola.length) {
            workers[args[0].toString()].disp = 'ocupado';
            cCola();
        }
    }
    else if (args[2].toString() === '') {
        console.log('resultados a peticion vacio del timer' + args[3]);
        workers[args[0]].carga = args[3];
    }
}


function printa (a) {
    a.map(function (a, i) {
        console.log('\t Parte ' + i + ': ' + a.toString()); 
    });
}

function buscaworker () {
    if (distr === 'equitable') {
        return buscaequi();
    }
    else {
        return buscalow();
    }
}

function buscaequi () {
    var w;
    for (var i in workers) {
        if (workers[i].disp === 'ready' && workers[i].jobs <= Math.round(tjobs/workers.length)) {
            w = i;
            tjobs++;
        }
    }
    return w;
}

function buscalow () {
    var w = null,
        car = 0, // carga aux
        aux = [],
        x;
    for (var i in workers) {
        if (workers[i].disp === 'ready') {
            aux.push([i, workers[i].carga]);
        }
    }
    aux.sort(function (a, b){
        return a[1] - b[1];
    });
    //devuelve algun indice entre 0, 1, 2 si confob.llw vale 3; 0, 1 si vale 2; 0 si vale uno. Los workers estan ordenadados en la variable aux segun la carga de trabaja hecha.
    x = Math.floor(Math.random() * llw); 
    return aux.length ? aux[0][0] : null;
}

function verb (a, b, c, args) {
    switch (a) {
    case 'r' :
        console.log('Request de cliente -> ' + b + ' con texto -> ' + c);
        printa(args);
        break;
    case 's' :
        console.log('Enviando peticion de cliente -> ' + args[2] + ' al worker -> ' + args[0] + ' usando el backend')
        break;
    case 'sr' :
        console.log('Request de worker -> ' + args[0] + ' con texto -> ' + args[4]);
        printa(args);
        console.log('Enviando respuesta de worker -> ' + args[0] + ' al cliente -> ' + args[2] + ' usando el frontend')
        break;
    case 'rw' :
        console.log('Request de worker -> ' + args[0] + ' con texto -> ' + args[2]);
        printa(args);
    };
}

function makeSender (reqsock) {
    var Promise = require('bluebird'),
        promises = [];

    reqsock.on('message', function () {
        // var args = [].slice.call(arguments);
        // var args = Array.apply(null, arguments);
        // args = args.toString().split(',');
        promises.shift().resolve(arguments);
    });
    reqsock.on('error', function(reason) {
        promises.shift().reject(reason);
    });

    return function (message) {
        return new Promise(function (resolve, reject) {
            promises.push({resolve: resolve, reject: reject});
            if (message)
                reqsock.send(message);
            //mas generico, no tenemos que cerrar el socket usando su ref del scope global
            this.reqsock = reqsock;
        });
    };
}

