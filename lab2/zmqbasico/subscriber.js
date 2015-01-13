/*------------------------Para probar, ejecute este comando --------------------
node subscriber.js localhost:5555 sport
*/
var args = process.argv;

//si argumentos son menos de los necesitados
if (args.length < 4) {
    console.log('Endpoint, descriptor_mensaje');
    process.exit();
}
var zmq = require('zmq'),
    subscriber = zmq.socket('sub'),
    i,
    pe = args[2], //publisher endpoint
    dm = args[3]; //descriptor del tipo de mensaje

subscriber.on("message", function(desc, msg) {
  console.log('Received message: ', msg.toString());
});

subscriber.connect("tcp://" + pe);
subscriber.subscribe(dm);

process.on('SIGINT', function() {
    subscriber.close();
    console.log('\nClosed');
});
