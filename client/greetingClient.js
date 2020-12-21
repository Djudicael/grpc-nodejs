
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('../protos/greet.proto', {});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const greetPackage = protoDescriptor.greet;

 function  main() {
    //callGreeting();
    // callGreetingManytime();
    // callLongGreeting();
    //  callBiDirectStreaming();
    doErrorCall();

}

async function sleep(interval) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), interval)
    })
}

async function callBiDirectStreaming() {
    const client = new greetPackage.GreetService("127.0.0.1:40000", grpc.credentials.createInsecure());


    const call = client.greetEveryone({}, (error, response) => {

        if (error) {
            console.log(error);
        }
        console.log(`Server response: ${JSON.stringify(response)}`)
    })

    call.on('data', response => {
        console.log(`Hello client: ${JSON.stringify(response)}`)

    })

    call.on('error', error => {
        console.error(error);
    })

    call.on('end', () => {
        console.log('Client the end');
    })

    for (let i = 0; i < 10; i++) {
        const request = { greet: { firstName: "jojo"+i, lastName: "rabit" } };
        
        call.write(request);
        await sleep(1500);
    }

    call.end();

}

function callLongGreeting() {
    const client = new greetPackage.GreetService("127.0.0.1:40000", grpc.credentials.createInsecure());

    const request = { greet: { firstName: "jojo", lastName: "rabit" } };

    const call = client.longGreet({}, (error, response) => {
        if (error) {
            console.log(error);
        }

        console.log(`Server response: ${JSON.stringify(response)}`)
    })

    let count = 0, intervalID = setInterval(() => {
        console.log(`Sending message ${count}`);

        call.write(request);
        if (++count > 3) {
            clearInterval(intervalID);
            call.end()
        }
    }, 1000);



}

function callGreetingManytime() {
    const client = new greetPackage.GreetService("127.0.0.1:40000", grpc.credentials.createInsecure());

    //create request
    const request = {
        greeting: {
            firstName: "boubm",
            lastName: "badaboum"
        }
    };

    const call = client.greetManyTimes(request, () => { });

    call.on('data', response => {
        console.log(`Client streaming response${JSON.stringify(response)} `);
    });

    call.on('status', (status) => {
        console.log(`Status: ${JSON.stringify(status)}`);
    });

    call.on('error', (error) => {
        console.log(`error: ${JSON.stringify(error)}`);
    });

    call.on('end', () => {
        console.log("streaming ended");
    });

}

function callGreeting() {
    const client = new greetPackage.GreetService("127.0.0.1:40000", grpc.credentials.createInsecure());
    
    
    const request = { greet: { firstName: "jojo", lastName: "rabit" } };
    
    client.greet(request, (error, { result }) => {
        
        if (error) {
            console.error(error);
        }
        
        if (!error) {
            console.log(`Greeting resposne ${result}`);
        }
    });
}


function doErrorCall(){
    const client = new greetPackage.GreetService("127.0.0.1:40000", grpc.credentials.createInsecure());

    const squareRootRequest ={number:-1}

    client.squareRoot(squareRootRequest,(error,response)=>{

        if(error){
            console.error(error);
        }
        
        console.log(` Square root is${JSON.stringify(response)}`);
    });

}


main();


