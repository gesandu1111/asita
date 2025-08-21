const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { SESSION_ID, SESSION_NAME } = require('./config');
const fs = require('fs');

// 🏁 Sinhala CLI Banner
console.log(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🤖 *GESANDU-MD Bot Start*   ┃
┃ 🏷️ Session: ${SESSION_NAME}       ┃
┃ 🔐 ID: ${SESSION_ID.slice(0, 20)}... ┃
┃ 🇱🇰 CLI: Sinhala Enabled       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_NAME);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: { level: 'silent' },
    browser: ['GESANDU-MD', 'Chrome', '120.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      console.log('📴 Bot disconnected. Reconnecting...');
      startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot connected successfully!');
    }
  });
}

startBot();
