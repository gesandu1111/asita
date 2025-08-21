module.exports = {
  command: ['.tagall'],
  description: 'Group එකේ හැමෝම tag කරන්න',
  handler: async ({ sock, m }) => {
    const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
    const participants = groupMetadata.participants;

    const mentions = participants.map(p => p.id);
    const tagList = participants.map(p => `👤 @${p.id.split('@')[0]}`).join('\n');

    await sock.sendMessage(m.key.remoteJid, {
      text: `🔔 *GESANDU-MD TAGALL*\n\n${tagList}`,
      mentions: mentions
    }, { quoted: m });

    console.log(`📣 .tagall executed — ${mentions.length} members tagged`);
  }
};
