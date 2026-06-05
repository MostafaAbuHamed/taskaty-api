function Category(name) {
    this.id = Math.random();
    this.name = name;
    this.createdAt = new Date().toISOString();
}

exports.Category = Category;