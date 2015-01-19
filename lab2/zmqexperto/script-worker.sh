#!/bin/bash

number=0
while [ $number -lt $1 ]; do
    echo "Worker $number"
    number=$((number + 1))
    node lbworker2.js localhost:5556 worker$number WorkerOK ready true &
done

node lbbroker2.js 5555 5556 5557 true &

number=0
while [ $number -lt $2 ]; do
    echo "Cliente $number"
    number=$((number + 1))
    node lbclient2.js localhost:5555 client$number ClientMSG ready &
done

