const fs = require("fs");
const path = require("path");

const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const connectToWhatsApp = async (userId) => {
  const authPath = path.join("auth_info_baileys", userId);

  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }

  const showQR = !fs.existsSync(path.join(authPath, "creds.json"));

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const sock = makeWASocket({
    printQRInTerminal: showQR,
    auth: state,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      // console.log(
      //   `Connection closed for user ${userId} due to`,
      //   lastDisconnect.error,
      //   ", reconnecting ",
      //   shouldReconnect
      // );

      // Reconnect if not logged out
      if (shouldReconnect) {
        console.log(`Didn't connect to WA for user ${userId}`);
        connectToWhatsApp(userId);
      }
    } else if (connection === "open") {
      console.log(`Opened connection for user ${userId}`);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (m) => {
    if (m.messages[0].key.fromMe) {
      return;
    }

    console.log(
      `Msg from ${m.messages[0].key.remoteJid}", ${m.messages[0].message.conversation}`
    );

    await sock.sendMessage(m.messages[0].key.remoteJid, {
      text: "I'll send my answer later",
    });
  });
};

// Connect a few users
const users = ["user1", "user2", "user3"]; // Users list
users.forEach(connectToWhatsApp);
