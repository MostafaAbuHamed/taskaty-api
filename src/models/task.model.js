const { generateId } = require("../utils/idGenerator.js");

function Task(title, description, dueDate = null) {
    this.id = generateId();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.status = "to-do";
    this.priority = "low";
    this.categoryId = "";
    this.tags = [];
    this.estimatedHours = 0;
    this.createdAt = new Date().toISOString();
    this.updatedAt = null;
}

exports.Task = Task;