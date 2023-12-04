console.log("server running")
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

//Array to store connected clients
const clients = []

server.on('connection', (socket) => {
    console.log('Client connected');
    clients.push(socket)
    console.log(clients)

    //When the client connects, send them a message to say how many clients are connected
    //this is used on the client side to determine which player the just-connected user will be
    socket.send(JSON.stringify(
        { 
            isInitialConnectionMessage: true,
            connectedClients: clients.length 
        }
        ));

    // Listen for messages from the client
    socket.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage.toString())
        console.log(`Received message: ${rawMessage}`);

        broadcast(message) //broadcast the received message out to each connected client
    });

    // Listen for the socket to close
    socket.on('close', () => {
        console.log('Client disconnected');
        clients.splice(clients.indexOf(socket), 1)
    });

});

const broadcast = (message) =>{
    const jsonString = JSON.stringify(message)
    clients.forEach(client =>{
        if (client.readyState === WebSocket.OPEN){
            client.send(jsonString)
        }
    })
}



