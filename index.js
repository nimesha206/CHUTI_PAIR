const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    let num = req.query.number;
    if (!num) {
        return res.send(`
            <html>
                <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
                    <h2>WhatsApp Pairing Code Generator</h2>
                    <form action="/">
                        <input type="text" name="number" placeholder="947XXXXXXXX" required>
                        <button type="submit">Get Code</button>
                    </form>
                </body>
            </html>
        `);
    }

    try {
        const { state } = await useMultiFileAuthState('session');
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" })
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            const code = await sock.requestPairingCode(num);
            res.send(`<h1>Your Pairing Code: <span style="color:blue;">${code}</span></h1><p>Enter this in your WhatsApp Linked Devices section.</p>`);
        } else {
            res.send("<h1>Already Linked!</h1>");
        }
    } catch (err) {
        res.send("Error: " + err.message);
    }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
