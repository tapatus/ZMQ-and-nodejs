#!/bin/bash
#se usa asi
#*sh script-worker.sh <numero_de_workers> <numero_de_clientes> > output_del_fichero_donde_escribira_el_modo_verbose*

number=0
while [ $number -lt $1 ]; do
    echo "Worker $number"
    number=$((number + 1))
    node lbworker.js localhost:5556 worker$number ready ok true &
done
node lbbroker.js 5555 5556 true &

number=0
while [ $number -lt $2 ]; do
    echo "Cliente $number"
    number=$((number + 1))
    node lbclient.js localhost:5555 client$number message &
done

