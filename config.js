const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
  // 🔐 Session ID for WhatsApp bot
  SESSION_ID: process.env.SESSION_ID === undefined
    ? '𝙶𝙴𝚂𝙰𝙽𝙳𝚄-𝙼𝙳=your-session-id-here'
    : process.env.SESSION_ID,

  // 🌐 Port for Express or Webhook
  PORT: process.env.PORT === undefined ? "8000" : process.env.PORT,

  // 🏷️ Bot identity
  SESSION_NAME: process.env.SESSION_NAME === undefined ? "gesandu" : process.env.SESSION_NAME,

  // 🗄️ Database connection (optional)
  POSTGRESQL_URL: process.env.POSTGRESQL_URL === undefined
    ? 'postgresql://postgres:@gesandu2005@db.example.supabase.co:5432/postgres'
    : process.env.POSTGRESQL_URL,
};
