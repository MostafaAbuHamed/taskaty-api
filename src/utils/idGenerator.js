const crypto = require('node:crypto');

// Single source of IDs for every model. Kept as a wrapper rather than calling
// crypto.randomUUID() at each call site so the ID strategy can change in one place.
function generateId() {
  return crypto.randomUUID();
}

exports.generateId = generateId;
