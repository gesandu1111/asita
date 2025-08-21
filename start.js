const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino'); // ✅ proper import

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('gesandu');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }), // ✅ proper pino instance
    browser: ['GESANDU-MD', 'Chrome', '120.0'],
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    if (update.connection === 'open') {
      console.log('✅ Bot connected successfully!');
    }
  });
}

startBot();
