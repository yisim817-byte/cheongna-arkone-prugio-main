module.exports = async function (req, res) {
  var raw = String(req.query.path || '');
  var path = raw.replace(/^\/+/, '');
  if (!path) path = 'index.html';
  if (path.endsWith('/')) path = path.slice(0, -1);
  if (path.indexOf('.') === -1) path += '.html';
  if (path.indexOf('..') !== -1 || path.charAt(0) === '/') {
    res.statusCode = 400; res.end(); return;
  }
  var dest = 'https://cdn.jsdelivr.net/gh/yisim817-byte/cheongna-arkone-prugio-main@main/' + path;
  try {
    var r = await fetch(dest);
    if (!r.ok) {
      res.statusCode = r.status === 404 ? 404 : 502;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('not found');
      return;
    }
    var ct = r.headers.get('content-type') || 'application/octet-stream';
    if (/\.html$/i.test(path)) ct = 'text/html; charset=utf-8';
    else if (/\.css$/i.test(path)) ct = 'text/css; charset=utf-8';
    else if (/\.js$/i.test(path)) ct = 'application/javascript; charset=utf-8';
    else if (/\.svg$/i.test(path)) ct = 'image/svg+xml';
    else if (/\.jpe?g$/i.test(path)) ct = 'image/jpeg';
    var buf = Buffer.from(await r.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('content-type', ct);
    res.setHeader('cache-control', 'public, max-age=300');
    res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('upstream error');
  }
};
