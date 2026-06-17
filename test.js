async function test() {
    const res = await fetch('http://localhost:3000/api/collections/batch?names=sales');
    console.log(res.status);
    console.log(res.headers.get('content-type'));
    const text = await res.text();
    console.log(text.substring(0, 100));
}
test();
