const axios = require('axios');

module.exports = {
  command: ['.dl'],
  description: 'Social media video/photo download',
  handler: async ({ sock, m, args }) => {
    const url = args[0];
    if (!url) {
      await sock.sendMessage(m.key.remoteJid, {
        text: '🔗 කරුණාකර URL එකක් ලබාදෙන්න: `.dl <url>`'
      }, { quoted: m });
      return;
    }

    try {
      const api = `https://api.lankadl.lk/download?url=${encodeURIComponent(url)}`; // Replace with actual API
      const res = await axios.get(api);
      const mediaUrl = res.data.media;
      const type = res.data.type; // 'video' or 'image'

      const mediaRes = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(mediaRes.data, 'binary');

      const message = type === 'video'
        ? { video: buffer, mimetype: 'video/mp4', caption: '📥 Downloaded via GESANDU-MD' }
        : { image: buffer, caption: '📥 Downloaded via GESANDU-MD' };

      await sock.sendMessage(m.key.remoteJid, message, { quoted: m });

      console.log(`📦 Social media content downloaded from: ${url}`);
    } catch (err) {
      console.error('❌ Download failed:', err);
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ Download එක fail වුනා. URL එක validද කියලා බලන්න.'
      }, { quoted: m });
    }
  }
};
