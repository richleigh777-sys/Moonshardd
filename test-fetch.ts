async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/collections/batch?names=users');
    console.log(res.status);
    console.log(res.headers.get('content-type'));
    const txt = await res.text();
    console.log(txt.substring(0, 100));
  } catch(e) {
    console.error(e);
  }
}
test();
