const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const clients = {};
const users = {};
let editorContent = null;
let userActivity = [];

const players = []
const responses = []
let result = null;

const resetGame = () => {
    console.log("reset")
    players.length = 0;
    responses.length = 0;
    result = null;
}



wsServer.on('connection', function handleNewConnection(connection) {
    const userId = uuidv4();
    console.log('Received a new connection');
    clients[userId] = connection;
    console.log(`${userId} connected.`);



    if (players[0] === undefined) {
        players[0] = userId;
    } else {
        players[1] = userId;
    }

    for (let i in players) {
        console.log(`${players[i]} send.`);
        clients[players[i]].send(JSON.stringify({
            "type": "player",
            "value": i,
        }));
        clients[players[i]].send(JSON.stringify({
            "type": "game",
            "value": "En attente",
        }));

    }
    

    // Écoute des messages provenant du client
    connection.on('message', (data) => {

        if (responses.length < 2) {

            let response = data.toString(); // Convertir les données en chaîne sinon affiché en binaire
            console.log(`Message received from ${userId}:`, response);

            //stocker la réponse dans un tableau de réponse possédent le meme index que le joueur
            if (players[0] === userId) {
                responses[0] = response;
            } else {
                responses[1] = response;
            }

            console.log(responses.length, "responses")

            if (responses.length == 2) {

                //Envoyer le resultat au client
        
                if (responses[0] == responses[1]) {
                    result = 'nul';
                }
                else if (responses[0] == 'pierre' && responses[1] == 'ciseaux' || responses[0] == 'feuille' && responses[1] == 'pierre' || responses[0] == 'ciseaux' && responses[1] == 'feuille') {
                    // setWinJ1(winJ1 + 1);
                    // setLoseJ2(loseJ2 + 1);
                    result = "j1"
                }
                else {
                    // setLoseJ1(loseJ1 + 1);
                    // setWinJ2(winJ2 + 1);
                    result = "j2"
                }
        
        
        
                switch (result) {
                    case 'j1':
                        clients[players[0]].send(JSON.stringify({
                             "value": "Vous avez gagné",
                             "type" : "game"
                            }));
                            clients[players[1]].send(JSON.stringify({
                                "value": "Vous avez perdu",
                                "type" : "game"
                               }));
                            
                            setTimeout(() => {
                                disconnectAllClients()
                            }, 10)
                        break;
                    case 'j2':
                        clients[players[0]].send(JSON.stringify({
                            "value": "Vous avez perdu",
                            "type" : "game"
                           }));
                           clients[players[1]].send(JSON.stringify({
                               "value": "Vous avez gagné",
                               "type" : "game"
                              }));
                              setTimeout(() => {
                                disconnectAllClients()
                            }, 10)
                        break;
                    case 'nul':
                        clients[players[0]].send(JSON.stringify({
                            "value": "Égalité",
                            "type" : "game"
                           }));
                           clients[players[1]].send(JSON.stringify({
                               "value": "Égalité",
                               "type" : "game"
                            }));
                              setTimeout(() => {
                                disconnectAllClients()
                            }, 10)
                        break;
                    default:
                        break;
                }
            }

        }

    });




    function disconnectAllClients() {
        for (let clientId in clients) {
            clients[clientId].close();
            delete clients[clientId];
        }

        resetGame();
    }

});





// Start the WebSocket server
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});