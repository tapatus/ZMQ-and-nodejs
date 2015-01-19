var zmq = require('zmq'),
    requester = zmq.socket('req'),
    args = process.argv,
    url = '',
    config = '';

if (args.length === 5) {
    url = args[2];
    config = JSON.stringify({
        'distribution' : 'equitable',
        'adjustFactor' : args[4]
    });
}
else if (args.length === 6) {
    url = args[2];
    config = JSON.stringify({
        'distribution' : 'lowerLoad',
        'periodicity' : args[4],
        'lowLoadWorkers' : args[5]
    });
}
else {
    console.log('Caso 1: url_a_quien_hacer_peticion, "equitable", adjustFactor!\n Caso 2: url_a_quien_hacer_peticion, "lowerLoad", periodicity, lowLoadWorkers'); 
    process.exit();
}

requester.connect('tcp://'+url);
requester.send(config);

requester.on('message', function(msg) {
    console.log('La configuracion de reparto de carga ha sido cambiada con exito. El servidor dice ' + msg.toString());
  process.exit();
});
