(async ()=>{
  try {
    const payload = {
      name: "Test Vendor",
      email: `testvendor_${Date.now()}@example.com`,
      password: "TestPass123",
      phone: "+1234567890",
      address: "Test Address"
    };

    const res = await fetch('http://localhost:5000/api/vendors/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('REQUEST ERROR', err);
  }
})();
