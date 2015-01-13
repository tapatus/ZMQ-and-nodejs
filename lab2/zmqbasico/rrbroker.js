/*------------------------Para probar, ejecute este comando-------------------
node rrbroker.js 5555 5556
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 4) {
    console.log('Puerto router, puerto dealer');
    process.exit();
}

var zmq      = require('zmq'),
    frontend = zmq.socket('router'),
    backend  = zmq.socket('dealer'),
    pr = args[2], //puerto router
    pd = args[3]; //puerto dealer

frontend.bindSync('tcp://*:' + pr);
backend.bindSync('tcp://*:' + pd);

frontend.on('message', function() {
  // Note that separate message parts come as function arguments.
  var args = Array.apply(null, arguments);
  // Pass array of strings/buffers to send multipart messages.
  backend.send(args);
});

backend.on('message', function() {
  var args = Array.apply(null, arguments);
  frontend.send(args);
});
