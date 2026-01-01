const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // QR අවශ්‍ය නැති නිසා false දමන්න
        logger: pino({ level: "silent" })
    });

    // මෙතනට ඔබේ දුරකථන අංකය ඇතුළත් කරන්න (උදා: 947XXXXXXXX)
    let phoneNumber = "947XXXXXXXX"; 

    if (!sock.authState.creds.registered) {
        await delay(1500);
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\nYOUR PAIRING CODE: ${code}\n`);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            console.log("සම්බන්ධතාවය බිඳ වැටුණි, නැවත උත්සාහ කරයි...");
            startBot();
        } else if (connection === "open") {
            console.log("Bot සාර්ථකව සම්බන්ධ විය!");
        }
    });
}

startBot();
