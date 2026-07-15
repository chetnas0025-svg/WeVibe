const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => { reject(err); });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=========================================");
  console.log("🔍 TESTING LOCAL SERVER AUTHENTICATION & API");
  console.log("=========================================");

  // Test 1: Writing to protected API table endpoint without login -> should be 401
  console.log("\n[Test 1] POST /api/categories (Unauthenticated)");
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/categories',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Category'
    });
    console.log(`Status Code: ${res.statusCode} (Expected: 401)`);
    console.log(`Body: ${res.body}`);
  } catch (err) {
    console.error("Test 1 failed:", err.message);
  }

  // Test 2: Accessing /admin page without login -> should redirect to /admin/login
  console.log("\n[Test 2] GET /admin (Unauthenticated)");
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/admin',
      method: 'GET'
    });
    console.log(`Status Code: ${res.statusCode} (Expected: 302/307 Redirect)`);
    console.log(`Location Header: ${res.headers.location} (Expected: /admin/login)`);
  } catch (err) {
    console.error("Test 2 failed:", err.message);
  }

  // Test 3: Log in using local dev credentials
  console.log("\n[Test 3] POST /api/auth/login (Local Dev Credentials)");
  let sessionCookie = '';
  try {
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@pinkandbluecafe.com',
      password: 'password'
    });
    console.log(`Status Code: ${loginRes.statusCode} (Expected: 200)`);
    console.log(`Body: ${loginRes.body}`);
    const setCookie = loginRes.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      sessionCookie = setCookie[0].split(';')[0];
      console.log(`Session Cookie Obtained: ${sessionCookie}`);
    } else {
      console.error("No Set-Cookie header returned!");
    }
  } catch (err) {
    console.error("Test 3 failed:", err.message);
  }

  if (!sessionCookie) {
    console.error("Cannot proceed without session cookie.");
    return;
  }

  // Test 4: Accessing protected API table endpoint WITH login cookie -> should be 200
  console.log("\n[Test 4] GET /api/categories (Authenticated)");
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/categories',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log(`Status Code: ${res.statusCode} (Expected: 200)`);
    const categories = JSON.parse(res.body);
    console.log(`Categories count returned: ${Array.isArray(categories) ? categories.length : 'Not an array'}`);
  } catch (err) {
    console.error("Test 4 failed:", err.message);
  }

  // Test 5: Accessing protected settings endpoint -> should include gemini_api_key
  console.log("\n[Test 5] GET /api/cafe_settings (Authenticated)");
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/cafe_settings',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log(`Status Code: ${res.statusCode} (Expected: 200)`);
    const settings = JSON.parse(res.body);
    const keyPresent = settings[0] && settings[0].hasOwnProperty('gemini_api_key');
    console.log(`Settings Row count: ${settings.length}`);
    console.log(`gemini_api_key field present: ${keyPresent} (Expected: true)`);
  } catch (err) {
    console.error("Test 5 failed:", err.message);
  }

  // Test 6: Accessing protected settings endpoint WITHOUT login cookie -> should redact gemini_api_key
  console.log("\n[Test 6] GET /api/cafe_settings (Unauthenticated)");
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/cafe_settings',
      method: 'GET'
    });
    console.log(`Status Code: ${res.statusCode} (Expected: 200)`);
    const settings = JSON.parse(res.body);
    const keyPresent = settings[0] && settings[0].hasOwnProperty('gemini_api_key');
    console.log(`Settings Row count: ${settings.length}`);
    console.log(`gemini_api_key field present: ${keyPresent} (Expected: false)`);
  } catch (err) {
    console.error("Test 6 failed:", err.message);
  }

  // Test 7: Logout -> should clear session
  console.log("\n[Test 7] POST /api/auth/logout");
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Cookie': sessionCookie
      }
    });
    console.log(`Status Code: ${res.statusCode} (Expected: 200)`);
    console.log(`Body: ${res.body}`);
    const setCookie = res.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      console.log(`Cookie cleared: ${setCookie[0]}`);
    } else {
      console.log("Cookie not cleared by header.");
    }
  } catch (err) {
    console.error("Test 7 failed:", err.message);
  }
}

runTests();
