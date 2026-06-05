const generateId = function() {
    let id = "";
    let number = Math.random().toString(36);
    let date = Date.now().toString();
    id += number + date;

    return id;
}

console.log(Math.random().toString(36).slice(2))

exports.generateId = generateId;