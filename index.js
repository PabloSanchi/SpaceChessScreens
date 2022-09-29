import express from 'express';
import httpImport from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { moves } from './public/game/demo.js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, updateDoc, setDoc, doc } from 'firebase/firestore/lite';
import dotenv from 'dotenv';
import ip from "ip";
import fetch from 'node-fetch';
// var spawn = require('child_process').spawn;
import { spawn } from 'child_process';

dotenv.config()

var app = express();
app.use(cors());
var http = httpImport.createServer(app);

var io = new Server(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['ngrok-skip-browser-warning'],
        // credentials: true
    },
    handlePreflightRequest: (req, res) => {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': req.headers.origin,
            'Access-Control-Allow-Credentials': true,
            'ngrok-skip-browser-warning': true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

// essentials
var child, url = process.argv.slice(3);
var hasFirebase = true, fireApp, db;
const __dirname = path.resolve();
const port = 8120;

// Setup files to be sent on connection
const filePath = "/public", vFile = "index.html", pruebas = "multiple.html";
const controllerFile = "controller/index.html"

// varibles
var superRes = {};
var screenNumber = 1;
var activeScreens = 0;
var myArgs = process.argv.slice(2); // get nScreens input 
var nScreens = Number(myArgs[0]);
var okDemo = false;

// start config
if (myArgs.length == 0 || isNaN(nScreens)) {
    console.log("Number of screens invalid or not informed, default number is 5.");
    nScreens = 5;
}
console.log(`Running LQ Space Chess for Liquid Galaxy with ${nScreens} screens!`);

// establish default dir
app.use(express.static(__dirname + filePath));


// show current tunnel url (for users)
app.get('/', (req, res) => {
    res.json({ url: url });
});

app.get('/:id', (req, res) => {
    // get inurl parameter
    const id = req.params.id

    // if parameter == controller
    if (id == "controller") {
        res.sendFile(__dirname + `${filePath}/${controllerFile}`);
    } else { // if it is a screen
        if (id <= nScreens) { // if the number is valid
            screenNumber = id
            res.sendFile(__dirname + `${filePath}/${pruebas}`);
        } else { // if the number is invalid, send notify screen
            res.send(`
            <body style="background-color: black;">
                <h1 style="font-family: Sans-serif; color: white;">
                    make sure that npm start SCREENUM is properly set
                </h1>
            </body>
            `);
        }
    }
});

io.on('connect', socket => {

    console.log(`User connected with id ${socket.id}`);

    // join the room taking care of the type (mobile, screen or controller)
    if (socket.handshake.query.mobile == 'true') {
        console.log('MOBILE');
        socket.join('mobile');
        okDemo = false;

        socket.to('screen').emit('killDemo');

    } else if (socket.handshake.query.controller == 'true') {
        console.log('CONTROLLER');
        socket.join('controller');
    } else {
        console.log('SCREEN');
        socket.join('screen');
    }

    
    /**
     * @description if users leaves, then notify
     */
    socket.on('quit', () => {
        console.log('user left');
    });

    /**
     * @description send screen id to the new screen (config)
     */
    if (!(socket.handshake.query.mobile == 'true') && !(socket.handshake.query.controller == 'true')) {
        io.to(socket.id).emit('update', {
            id: screenNumber
        });
    }

    /**
     * @description get window size data of each screen
     */
    socket.on('windowSize', (data) => {
        superRes[data.id] = data.width;
        activeScreens++;

        // if all screens are connected
        if (activeScreens == nScreens) {
            let r = 0;
            let pos = []

            Object.entries(superRes).forEach(res => {
                console.log(res[1]);
                r += res[1];
            });

            console.log('sending start signal');

            // stars coordinates (same for all screens)
            for (let index = 0; index < 8000; index++) {
                pos[index] = [Math.random() * 2000 - 500, Math.random() * 2000 - 500]
            }

            io.to('screen').emit('start', {
                width: r,
                height: 0,
                child: superRes,
                pos: pos
            });

            activeScreens = 0;
        }
    });

    /**
     * @DEPRECATED : will be removed soon!
     * @description transmit master mouse event
     */
    socket.on('updateScreens', (mouse) => {
        io.to('screen').emit('updateMouse', mouse);
    });

    /**
     * @description tell the screen to move the camera the specified amount
     * @param {Object} data
     */
    socket.on('updatePos', (pos) => {
        io.to('screen').emit('updatePosScreen', pos);
    });

    /**
     * @description tell the screen to change the view to de specified coordinates
     * @param {Object} data
     */
    socket.on('updateView', (data) => {
        io.to('screen').emit('setView', data);
    });

    /**
    * @description newStatus - recieve the status and move from the client
    *               and send the move to the screens
    *    
    * @param {Object} data; contains the status (string) and the move (string)
    */
    socket.on('newStatus', (data) => {
        okDemo = false;
        console.log('FEN: ' + data.status);
        console.log('Move: ' + data.move);

        io.to('screen').emit('updateFen', {
            status: data.status,
            move: data.move
        });
    });

    /**
    * @description currentBoard - recieve the current status from the client
    *            and send the status to the screens
    * 
    * @param {Object} data; contains the status (string)
    */
    socket.on('currentBoard', (data) => {
        okDemo = false;
        console.log('Current Board: ' + data.status);

        io.to('screen').emit('updateFen', {
            status: data.status,
            move: ''
        });
    });

    /**
    * @description controllerMove -> use the device or proper controller to move around the screens
    * @param {Object} data; X and Z coordinates
     */
    socket.on('controllerMove', (data) => {
        io.to('screen').emit('controllerUpdate', data);
    });

    /**
    * @DEPRECATED : will be removed soon!
    * @description showDemo, send the screen a chess complete game to show how to game works
    * @param {Object} data; contains all the moves
     */
    socket.on('showDemo', () => {
        okDemo = true;
        console.log('starting demo...');
        // reset keyboard
        io.to('screen').emit('updateFen', {
            status: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
            move: ''
        });

        let cont = 1;

        moves.every(async (move) => {
            if (!okDemo) return false;
            io.to('screen').emit('demoMove', {
                main: move,
                index: cont
            });

            cont++;
            return true
        });

    });

    /**
     * @description showEarth -> tell the screens to show the earth view
     */
    socket.on('showEarth', () => {
        io.to('screen').emit('goEarth');
    });


    /**
     * @description showChess ->  tell the screens to show the chess view
     */
    socket.on('showChess', () => {
        io.to('screen').emit('goChess');
    });

    /**
     * @description refreshEarthServer -> syncronize the earth position between the screens
     */
    socket.on('refreshEarthServer', (coord) => {
        io.to('screen').emit('refreshEarthScreen', coord);
    });

    /**
     * @description poweroff the Liquid Galaxy Cluster
     */
    socket.on('poweroff', () => {
        console.log('shuting down');
        spawn('lg-poweroff');
    })

    /**
     * @description reboot the Liquid Galaxy Cluster
     */
    socket.on('reboot', () => {
        console.log('rebooting...');
        spawn('lg-reboot');
    })

    /**
     * @description reboot the Liquid Galaxy Cluster
     */
    socket.on('relaunch', () => {
        console.log('relaunching...');
        spawn('lg-relaunch');
    })  

    /**
     * @description tell the screens to show/hide the logos/sponsors
     */
    socket.on('hideLogos', () => {
        console.log('hiding/showing logos');
        io.to('screen').emit('viewlogos');
    });

    /**
     * @description send the screen the moves array
     * @param {Object} data: data.moves contains the array with the moves
     */
    socket.on('demoContent', (data) => {
        console.log('starting demo...');
        io.to('screen').emit('startDemo', data);
    });

    /**
     * @description tell the screens to play/pause the demo
     */
    socket.on('playstop', () => {
        io.to('screen').emit('playpause');
    });

    // set demo speed
    /**
     * @description tell the screens to change the demo speed
     * @param {Object} data: contains the speed value to set
     */
    socket.on('demoSpeed', (data) => {
        io.to('screen').emit('xVel', data);
    });

    /**
     * @description tell the screens to move the next movement
     */
    socket.on('demoForward', () => {
        io.to('screen').emit('forward');
    });

    /**
     * @description tell the screens to go undo the last move
     */
    socket.on('demoBackward', () => {
        io.to('screen').emit('backward');
    });

    /**
     * @description tell the screens to reset everything
     */
    socket.on('killAll', () => {
        console.log('reseting...');
        socket.to('screen').emit('resetAll');
    });

    /**
     * @description tell the screens to kill the ongoing demo
     */
    socket.on('demoKill', () => {
        socket.to('screen').emit('killDemo');
    });

    /**
     * @description tell the screens to show/hide the votes
     * @param {Object} data: player's votes
     */
    socket.on('showVotes', (data) => {
        console.log('votes recieved', data);
        socket.to('screen').emit('displayVotes', data);
    });


    // DEMO PLAYS SOCKET EVENTS

    /**
     * @description start demo event
     */
    socket.on('startDemo', () => {
        console.log('starting demo...');
        io.to('screen').emit('startDemo');
    });

    /**
     * @description recieve a move from the controller and send the order to the screens
     */
    socket.on('demoMove', (data) => {
        console.log('move demo');
        
        socket.to('screen').emit('moveDemo', data);
    });
    
    /**
     * @description recieve backward call from the mobile and send the order to the screens
     */
    socket.on('demoBack', (data) => {
        socket.to('screen').emit('moveDemoBack', data);
    });

    // ------------------------

});


/**
    @description launch -> launch tunnel between the localhost and internet
        and save the url in the database if possible
*/
function launch() {
    // Create a child process
    // child = spawn('ssh', ['-R', '80:localhost:8120', 'nokey@localhost.run']);
    // child = spawn('ngrok', ['http', '8120', '--authtoken=2FRAcOboMuYRMzpSUy1kAkPVC70_6J3Dzfvoi4h3no3vMaR4q']);
    // child = spawn('ngrok', ['http', '8120', '--authtoken=2FRAcOboMuYRMzpSUy1kAkPVC70_6J3Dzfvoi4h3no3vMaR4q']);

    const IPaddress =  ip.address();
    console.log('MUST CONNECT TO: ' + IPaddress);
    if(hasFirebase && url[0] != '') {
        setDoc(doc(db, "rig", IPaddress), {
            ip: url[0],
        }).then(() => {
            console.log('ip added: ', url[0]);
        }).catch(() => {
            console.log('error');
        });
    }


    // get output
    // child.stdout.on('data',
    //     function (data) {
    //         // get the provided url
    //         var regexp = /.*tunneled with tls termination, https:\/\/.*/gi;
    //         var matches_array = data.toString().match(regexp);
    //         var str = matches_array.join('');
    //         url = str.split(', ')[1];
    //         console.log('launch url: ' + url);
            
    //         if(hasFirebase) {
    //             setDoc(doc(db, "rig", ip.address()), {
    //                 ip: url,
    //             }).then(() => {
    //                 console.log('ip added: ', url);
    //             }).catch(() => {
    //                 console.log('error');
    //             });
    //         }
    //     });

    // child.stdout.on('data',
    // function (data) {
    //     console.log(data)
    //     // get the provided url
    //     var regexp = /.*Forwarding.*https:\/\/.*/gi;
    //     var matches_array = data.toString().match(regexp);
    //     var str = matches_array.join('');
    //     // url = str.split(', ')[1];
    //     console.log('launch url: ' + url);
        
    //     // if(hasFirebase) {
    //     //     setDoc(doc(db, "rig", ip.address()), {
    //     //         ip: url,
    //     //     }).then(() => {
    //     //         console.log('ip added: ', url);
    //     //     }).catch(() => {
    //     //         console.log('error');
    //     //     });
    //     // }
    // });
    
    // // display errors
    // child.stderr.on('data', (data) => {console.log(data.toString())});

    // // display command termination
    // child.on('close', function (code) {
    //     console.log('child process killed');
    // });
}

/**
 * @description Try top initialize firebase
 */
try {
    const firebaseConfig = {
        apiKey: process.env.APIKEY,
        authDomain: process.env.AUTHDOMAIN,
        projectId: process.env.PROJECTID,
        storageBucket: process.env.STORAGEBUCKET,
        messagingSenderId: process.env.MESSAGESENDERID,
        appId: process.env.APPID,
    };
    fireApp = initializeApp(firebaseConfig);
    db = getFirestore();

    // launch();
} catch (err) {
    console.log('Automatic IP connection deactivated');
    hasFirebase = false;
}

// launch IP on start
setTimeout(() => {launch()}, 1000);

// // keep alive url by fetching it every 10 seconds
// setTimeout(() => {
//     setInterval(() => {
//         fetch(url, {
//             method: 'GET',
//         })
//         .then(res => res.json())
//         .then(json => {
//             console.log([new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()].join(':'), json);
//         })
//         .catch(err => {
//             console.log('no ssh port anymore, restarting...');
//             if(child) child.kill();
//             launch();
//         });
//     }, 10000);
// }, 15000);

// start server on port 8120
http.listen(port, () => {
    console.log(`Listening:\nhttp://localhost:${port}`);
});