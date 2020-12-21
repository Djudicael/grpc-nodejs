
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./protos/todo.proto', {});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const todoPackage = protoDescriptor.todoPackage;


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
    server.addService(todoPackage.Todo.service,
        {
            "createTodo": createTodo,
            "readTodos": readTodos,
            "readTodosStream": readTodosStream
        });

}


const todos = [];



function createTodo({ request }, callback) {

    const todoItem = {
        id: todos.length + 1,
        text: request.text
    }
    todos.push(todoItem)
    console.log(todos);
    callback(null, todoItem);

}

function readTodosStream(call, callback) {

    todos.forEach(t=>call.write(t));
    call.end()

}

function readTodos(call, callback) {
    callback(null, { "items": todos })
}


main();




