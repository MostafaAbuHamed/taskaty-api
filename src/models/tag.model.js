const { generateId } = require("../utils/idGenerator");

function Tag(name) {
    this.id = generateId();
    this.name = name;
    this.createdAt = new Date().toISOString();
}

exports.Tag = Tag;