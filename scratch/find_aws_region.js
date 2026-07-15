const https = require('https');
https.get('https://ip-ranges.amazonaws.com/ip-ranges.json', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    for (const prefix of data.ipv6_prefixes) {
      if (prefix.ipv6_prefix.startsWith('2406:da14:')) {
        console.log(`Prefix: ${prefix.ipv6_prefix}, Region: ${prefix.region}, Service: ${prefix.service}`);
      }
    }
  });
});
