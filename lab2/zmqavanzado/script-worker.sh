#!/bin/bash

number=0
while [ $number -lt $1 ]; do
    echo "Worker $number"
    number=$((number + 1))
    node lbworker.js localhost:5556 worker$number WorkerOK ready true &
done
node lbbroker.js 5555 5556 true &

number=0
while [ $number -lt 10 ]; do
    echo "Cliente $number"
    number=$((number + 1))
    node lbclient.js localhost:5555 client$number ClientMSG ready true &
done

