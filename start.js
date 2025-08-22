// index.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const config = require('./config'); // SESSION_ID, OWNER_NUM, etc.
const { sms } = require('./lib/msg');
const { getGroupAdmins } = require('./lib/functions');

const ownerNumber = Array.isArray(config.OWNER_NUM) ? config.OWNER_NUM : [config.OWNER_NUM];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['GESANDU-MD', 'Chrome', '120.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  // 🔌 Plugins Loader
  const pluginsPath = path.join(__dirname, 'plugins');
  if (fs.existsSync(pluginsPath)) {
    fs.readdirSync(pluginsPath).forEach(file => {
      if (path.extname(file).toLowerCase() === '.js') require(path.join(pluginsPath, file));
    });
    console.log('✅ All plugins loaded successfully.');
  }

  // Connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) console.log('📌 QR Code received, scan it with WhatsApp app.');
    if (connection === 'close') {
      console.log('❌ Connection closed. Reconnecting...');
      console.log('Reason:', lastDisconnect?.error?.output?.statusCode);
      setTimeout(startBot, 5000);
    } else if (connection === 'open') {
      console.log('✅ Bot connected successfully!');
      // Auto-send message to owner
      ownerNumber.forEach(num => {
        sock.sendMessage(num + '@s.whatsapp.net', { text: '🤖 Bot is now active!' });
      });
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async (meks) => {
    let mek = meks.messages[0];
    if (!mek.message) return;
    mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
    if (mek.key?.remoteJid === 'status@broadcast') return;

    const m = sms(sock, mek); // your helper function
    const type = getContentType(mek.message);
    const body =
      type === 'conversation' ? mek.message.conversation :
      type === 'extendedTextMessage' ? mek.message.extendedTextMessage.text :
      type === 'imageMessage' && mek.message.imageMessage.caption ? mek.message.imageMessage.caption :
      type === 'videoMessage' && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';

    const isCmd = body.startsWith(config.PREFIX || '.');
    const command = isCmd ? body.slice((config.PREFIX || '.').length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');
    const from = mek.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = mek.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : mek.key.participant || from;
    const senderNumber = sender.split('@')[0];
    const botNumber = sock.user.id.split(':')[0];
    const pushname = mek.pushName || 'Unknown';
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(sock.user.id);
    const groupMetadata = isGroup ? await sock.groupMetadata(from).catch(() => {}) : '';
    const groupAdmins = isGroup ? await getGroupAdmins(groupMetadata.participants) : [];
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
    const reply = (text) => sock.sendMessage(from, { text }, { quoted: mek });

    if (isCmd) {
      const events = require('./command'); // your command loader
      const cmdObj = events.commands.find(c => c.pattern === command) ||
                     events.commands.find(c => c.alias?.includes(command));
      if (cmdObj) {
        try {
          cmdObj.function(sock, mek, m, {
            from, body, isCmd, command, args, q, isGroup, sender,
            senderNumber, botNumber2, botNumber, pushname, isMe,
            isOwner, groupMetadata, groupAdmins, isBotAdmins, isAdmins, reply,
          });
        } catch (err) {
          console.error('[PLUGIN ERROR]', err);
        }
      }
    }
  });
}

startBot();
