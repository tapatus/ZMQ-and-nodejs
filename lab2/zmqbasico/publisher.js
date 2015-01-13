/*------------------------Para probar, ejecute este comando-------------------
node publisher.js 5555 100 sport economics
*/

var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 6) {
    console.log('Puerto, numero_de_mensajes, descritor_1, descriptor_2');
    process.exit();
}

var zmq = require('zmq'),
    publisher = zmq.socket('pub'),
    i,
    getrandom = function (a) {
        return Math.floor((Math.random() * a) + 1);
    },
    pp = args[2], //publisher port
    nm = args[3], //numero de mensajes a publicar
    dm1 = args[4]; //descriptor de tipo 1
    dm2 = args[5]; //descriptor de tipo 2

publisher.bind('tcp://*:' + pp, function(err) {
  if(err)
      console.log(err);
  else
      console.log("Listening on " + pp + "...");
});

for (i = 1 ; i < nm ; i++)
    setTimeout(function() {
        console.log('sent');
        publisher.send([dm1, dm1 + ' ' + getrandom(1000)]);
        publisher.send([dm2, dm2 + ' ' + getrandom(1000)]);
    }, 1000 * i);

process.on('SIGINT', function() {
    publisher.close();
    console.log('\nClosed');
});
