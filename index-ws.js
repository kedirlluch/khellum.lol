const express = require('express');
const { get } = require('http');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });

});

server.on('request', app);
server.listen(3000, function() {
    console.log('Server started on Port 3000');
});


process.on('SIGINT', () => {
    wss.clients.forEach( (client) => {
        client.close();
    });
    
    server.close(() => {
        shutdownDB();
    })
});

/** Begin WebSocket*/

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;
    console.log('New client connected. Total clients: ' + numClients);

    wss.broadcast(`Current visitor  count: ${numClients}`);

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome new client!');
    }

    db.run(` INSERT INTO visitors (count, time)
            VALUES (${numClients}, datetime('now'))
        `);

    ws.on('close', function close() {
        wss.broadcast(`Current visitor  count: ${wss.clients.size}`);
        console.log('Client disconnected!');
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};


/** End WebSocket */
/** Begin database */

const sqlite = require('sqlite3');

const db = new sqlite.Database(':memory:');

db.serialize( () => {
    db.run(`
        Create table visitors (
            count INTEGER,
            time TEXT

        )    
    `)
});

function getCounts(){
    db.each("SELECT * from visitors", (err, row) => {
        console.log(row)
    })
}

function shutdownDB(){
    getCounts();
    console.log("Closing DataBase");

    db.close();
}