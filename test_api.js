(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("HEADERS:", res.headers);
    console.log("BODY:", text);
  } catch (err) {
    console.error(err);
  }
})();
