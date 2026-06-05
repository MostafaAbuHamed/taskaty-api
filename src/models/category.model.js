const { generateId } = require("../utils/idGenerator");

function Category(name) {
    this.id = generateId();
    this.name = name;
    this.createdAt = new Date().toISOString();
}

exports.Category = Category;