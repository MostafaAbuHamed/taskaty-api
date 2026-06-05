function Tag(name) {
    this.id = Math.random();
    this.name = name;
    this.createdAt = new Date().toISOString();
}

exports.Tag = Tag;