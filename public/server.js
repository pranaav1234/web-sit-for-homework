const http = require('http');
const https = require('https');
const url = require('url');

const API_KEY = 'mA0CU7kB9gIdD8RpEfayv5qKbP1wjzHuTW4c3ZhnJ2LGoelrS6SAfNFgysL6vOTQrPwntKE9172qXWmJ';
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/send-otp') {
    const mobile = parsed.query.mobile;
    const otp    = parsed.query.otp;

    if (!mobile || !otp) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({success:false, message:'Mobile and OTP required'}));
      return;
    }

    console.log(`Sending OTP ${otp} to ${mobile}...`);

    const options = {
      hostname: 'www.fast2sms.com',
      path: `/dev/bulkV2?authorization=${API_KEY}&route=otp&variables_values=${otp}&numbers=${mobile}&flash=0`,
      method: 'GET',
      headers: { 'authorization': API_KEY }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Fast2SMS response:', JSON.stringify(json));
          if (json.return === true) {
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({success:true, message:'OTP sent successfully'}));
          } else {
            const errMsg = Array.isArray(json.message) ? json.message.join(', ') : (json.message || 'Unknown error');
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({success:false, message:errMsg}));
          }
        } catch(e) {
          console.error('Parse error:', e, 'Raw:', data);
          res.writeHead(500, {'Content-Type':'application/json'});
          res.end(JSON.stringify({success:false, message:'Server parse error'}));
        }
      });
    });

    apiReq.on('error', (e) => {
      console.error('HTTPS error:', e.message);
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({success:false, message:'Network error: ' + e.message}));
    });

    apiReq.end();

  } else {
    res.writeHead(404, {'Content-Type':'application/json'});
    res.end(JSON.stringify({message:'Not found'}));
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ ZOTO SMS Server running at http://localhost:${PORT}`);
  console.log(`   API Key: ${API_KEY.substring(0,10)}...`);
  console.log(`   Test: http://localhost:${PORT}/send-otp?mobile=9999999999&otp=123456\n`);
});
