const http = require('http');

console.log('Simulating CMS Save operations...');

function postJSON(url, payload) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(payload);
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + responseBody));
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const url = 'http://localhost:5000/api/data/services.json';
  const saveUrl = 'http://localhost:5000/api/save';

  try {
    const originalServices = await fetchJSON(url);
    console.log('Original services fetched.');

    // Make a copy of services
    const updatedServices = JSON.parse(JSON.stringify(originalServices));

    // Modify Service #1 pointers (add one)
    updatedServices[0].subServices.push({
      title: 'Temporary Test Pointer',
      description: 'This is a test pointer added by automated testing script.'
    });

    console.log('Sending mock save payload to /api/save...');
    const saveResponse = await postJSON(saveUrl, {
      filename: 'services.json',
      data: updatedServices
    });

    if (saveResponse.success) {
      console.log('Save API returned success!');
    } else {
      throw new Error('Save API returned failure: ' + JSON.stringify(saveResponse));
    }

    // Fetch again and verify
    const verifiedServices = await fetchJSON(url);
    const firstService = verifiedServices[0];
    const testPointer = firstService.subServices.find(p => p.title === 'Temporary Test Pointer');

    if (testPointer && firstService.link === 'services.html#hr-strategy') {
      console.log('✅ Success: Temporary pointer was saved and hidden link remained intact!');
    } else {
      throw new Error(`Verification failed. Link: ${firstService.link}, Pointer count: ${firstService.subServices.length}`);
    }

    // Restore original state
    console.log('Restoring original services payload...');
    await postJSON(saveUrl, {
      filename: 'services.json',
      data: originalServices
    });
    console.log('✅ Database successfully restored.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Save simulation test failed:', err.message);
    process.exit(1);
  }
}

run();
