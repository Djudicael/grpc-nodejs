const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('../protos/greet.proto',
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const greetPackage = protoDescriptor.greet;

function main() {
    const server = new grpc.Server();
    server.bindAsync("127.0.0.1:40000", grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.log(error);
        }
        server.start();
        console.log(` Server running on port ${port}`);
    });


    // add service
    server.addService(greetPackage.GreetService.service,
        {
            greet: greet,
            greetManyTimes: greetManyTimes,
            longGreet: longGreet,
            "greetEveryone": greetEveryone,
            squareRoot: squareRoot

        });

}

async function sleep(interval) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), interval)
    })
}

async function greetEveryone(call, callback) {

    call.on('data', response => {

        const { greet } = response;
        const fullName = greet.first_name + ' ' + greet.last_name;

        console.log(`Hello ${fullName}`);

    })

    call.on('error', error => {
        console.error(error);
    })

    call.on('end', () => {
        console.log('the end');
    })

    for (let i = 0; i < 10; i++) {
        const request = {
            result: "tata yoyo"
        }
        await sleep(1000);
        call.write(request);
    }

    call.end();
}

function greet({ request }, callback) {

    const { greet } = request;

    const greeting = {
        result: ` hello  + ${greet.firstName} ${greet.lastName}`
    }

    callback(null, greeting);

}

function greetManyTimes(call, callback) {
    console.log(call);

    const { greeting } = call.request;
    const firstName = greeting.first_name;

    let count = 0, intervalID = setInterval(() => {
        const greetManyTimesResponse = {
            result: firstName
        }
        //setup streaming
        call.write(greetManyTimesResponse);

        if (++count > 9) {
            clearInterval(intervalID);
            call.end(); // we have sent all messages!
        }

    }, 1000);
}

function longGreet(call, callback) {

    call.on('data', request => {

        const { greet } = request;
        const fullName = greet.first_name + ' ' + greet.last_name;
        console.log(`Hello ${fullName}`);
    })

    call.on('error', error => {
        console.log(error);
    })

    call.on('end', () => {
        const response = {
            result: 'Long greet client streaming'
        }

        callback(null, response);
    })

}

function squareRoot({ request }, callback) {
    const { number } = request;

    if (number >= 0) {
        const numberRoot = Math.sqrt(number);
        const response = { number_root: numberRoot };

        callback(null, response);
    }else{
        return callback({
            code:grpc.status.INVALID_ARGUMENT,
            message:' The number being sent is not positive ' + ' Number sent '+number
        })
    }

}

main();