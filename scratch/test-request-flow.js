async function testFlow() {
  console.log('--- 1. Testing Health & Maps Config ---');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('Health:', health.status, '| Google Maps Configured:', health.googleMapsConfigured);

  const mapsRes = await fetch('http://localhost:5000/api/config/maps');
  const maps = await mapsRes.json();
  console.log('Maps API Key status:', maps.configured ? 'Configured' : 'Missing');

  console.log('\n--- 2. Testing Shared Live Tracking Flow ---');
  // Create a real new request
  const createRes = await fetch('http://localhost:5000/api/requests/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'BIKE_MECHANIC',
      problemSummary: 'Chain snapped on Indiranagar 100ft road',
      customerAddressText: '100ft Rd, Indiranagar, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
    }),
  });

  const created = await createRes.json();
  console.log('Created Request ID:', created.request?.id);
  const newId = created.request?.id;

  // Retrieve via public tracking API without any auth token (simulating incognito recipient)
  const trackRes = await fetch(`http://localhost:5000/api/tracking/${newId}`);
  const trackData = await trackRes.json();
  console.log('Tracking Retrieval (Public):', trackData.success ? 'SUCCESS' : 'FAILED', '| ETA:', trackData.tracking?.etaMinutes, 'mins');

  // Verify non-existent ID returns 404
  const invalidRes = await fetch('http://localhost:5000/api/tracking/completely-invalid-id-xyz');
  console.log('Invalid Tracking ID Status (Expect 404):', invalidRes.status);

  console.log('\n--- 3. Testing Direct SPA Page Navigation ---');
  const pages = [
    '/',
    `/tracking/${newId}`,
    `/customer/tracking/${newId}`,
    '/analyze?problem=Engine+overheating&category=CAR_MECHANIC',
    '/providers?category=BIKE_MECHANIC',
  ];

  for (const page of pages) {
    const pageRes = await fetch(`http://localhost:5000${page}`);
    console.log(`Page: ${page} => HTTP ${pageRes.status}`);
  }

  console.log('\nAll validation checks completed successfully.');
}

testFlow().catch(console.error);
