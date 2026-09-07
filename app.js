// Application setup: one request handler, no routing yet.
// Wave 1 deliberately stops here — the Router is wired in a later task.
const NOT_FOUND = {
  success: false,
  error: { status: 404, message: 'Not Found' },
};

function app(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 404;
  res.end(JSON.stringify(NOT_FOUND));
}

module.exports = app;
