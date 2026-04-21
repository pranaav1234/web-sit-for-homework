const express = require('express');
const https = require('https');
const url = require('url');
const path = require('path');

const API_KEY = 'mA0CU7kB9gIdD8RpEfayv5qKbP1wjzHuTW4c3ZhnJ2LGoelrS6SAfNFgysL6vOTQrPwntKE9172qXWmJ';
const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.get('/send-otp', (req, res) => {
  const mobile = req.query.mobile;
  const otp = req.query.otp;

  if (!mobile || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile and OTP required' });
  }

  const apiUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&route=otp&variables_values=${otp}&numbers=${mobile}&flash=0`;

  https.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Fast2SMS response:', json);
        if (json.return === true) {
          res.json({ success: true, message: 'OTP sent successfully' });
        } else {
          res.json({ success: false, message: json.message || 'Failed to send OTP' });
        }
      } catch (e) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    });
  }).on('error', (e) => {
    console.error('API error:', e);
    res.status(500).json({ success: false, message: 'Failed to reach SMS service' });
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`✅ The Prime SMS server running at http://localhost:${PORT}`);
  console.log(`   Send OTP: http://localhost:${PORT}/send-otp?mobile=9999999999&otp=123456`);
});
