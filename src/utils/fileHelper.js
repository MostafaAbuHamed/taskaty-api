// STUB: temporary in-memory storage
// TODO: replace with real fs read/write after lesson 67

const readData = function(dataStore) {
    return dataStore;
}

const writeData = function(dataStore, newItem) {
    dataStore.push(newItem);
    return dataStore;
}

exports.readData = readData;
exports.writeData = writeData;