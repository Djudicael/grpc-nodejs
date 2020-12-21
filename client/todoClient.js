
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('../protos/todo.proto', {});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const todoPackage = protoDescriptor.todoPackage;

const client = new todoPackage.Todo("127.0.0.1:40000", grpc.credentials.createInsecure());

client.createTodo({ "id": -1, "text": " joho d" }, (err, response) => {
    console.log(`receive from server  ${JSON.stringify(response)}`);
});

const readTodosHandler = (err, response) => {
    console.log(`receive from server  ${JSON.stringify(response)}`);

    const { items } = response;

    if (items) {

        items.forEach(element => console.log(element));
    }
}
//client.readTodos({}, readTodosHandler);

const call = client.readTodosStream();

call.on("data", item => {
    console.log(`receive item from server  ${JSON.stringify(item)}`);
});

call.on("end", error => console.log("server done"))


