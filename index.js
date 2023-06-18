import { AndroidRemote, RemoteKeyCode, RemoteDirection } from './lib/index.js';
import fs from 'fs';
import express from 'express';

let host = "192.168.0.120";
let certFileName = 'cert.bin';

let options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'Google TV',
    cert: fs.existsSync(certFileName) ? JSON.parse(fs.readFileSync(certFileName)) : undefined
}

let androidRemote = new AndroidRemote(host, options);

// Wait for the AndroidRemote to start
androidRemote.start();


// Initialize express app
let app = express();

// Recieve android code
app.get('/auth', async (req, res) => {
    let code = req.query.code;
        androidRemote.sendCode(code);
});

// Define the endpoint for sending keycode
app.get('/send-keycode', async (req, res) => {
    let keycode = req.query.keycode;

    // Check if the keycode exists in the RemoteKeyCode object
    if (RemoteKeyCode.hasOwnProperty(keycode)) {
        console.log(`Sending keycode: ${keycode}`);
        try {
            await androidRemote.sendKey(RemoteKeyCode[keycode], RemoteDirection.SHORT);
            res.status(200).send(`Sent keycode: ${keycode}\n`);
        } catch (err) {
            console.error(`Error sending keycode: ${err}`);
            res.status(500).send(`Error sending keycode: ${err}\n`);
        }
    } else {
        console.error(`Invalid keycode: ${keycode}`);
        res.status(400).send(`Invalid keycode: ${keycode}\n`);
    }
});

app.get('/send-app', async (req, res) => {
    let encodedAppUri = req.query.uri;
    let decodedAppUri;

    // Decode the URI
    try {
        decodedAppUri = decodeURIComponent(encodedAppUri);
    } catch (err) {
        console.error(`Error decoding app URI: ${err}`);
        res.status(400).send(`Error decoding app URI: ${err}\n`);
        return;
    }

    console.log(`Sending app_uri: ${decodedAppUri}`);
    try {
        await androidRemote.sendAppLink(decodedAppUri);
        res.status(200).send(`Sent app uri: ${decodedAppUri}\n`);
    } catch (err) {
        console.error(`Error sending app uri: ${err}`);
        res.status(500).send(`Error sending app uri: ${err}\n`);
    }
});


app.listen(3333, '127.0.0.1');  // Listen on port 3333
