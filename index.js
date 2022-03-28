function getValueIgnoringKeyCase(object, key) {
    const foundKey = Object
        .keys(object)
        .find(currentKey => currentKey.toLocaleLowerCase() === key.toLowerCase());
    return object[foundKey];
}

function getBoundary(event) {
    return getValueIgnoringKeyCase(event.headers, 'Content-Type').split('=')[1];
}

module.exports.parse = (event, spotText) => {
    const boundary = getBoundary(event);
    const result = {};
    event.body
        .split(boundary)
        .forEach(item => {
            if (/filename=".+"/gi.test(item)) {
                result[item.match(/name=".+";/gi)[0].slice(6, -2)] = {
                    type: 'file',
                    filename: item.match(/filename=".+"/gi)[0].slice(10, -1),
                    contentType: item.match(/Content-Type:\s.+/gi)[0].slice(14),
                    content: spotText? Buffer.from(item.slice(item.search(/Content-Type:\s.+/gi) + item.match(/Content-Type:\s.+/gi)[0].length + 4, -4), 'binary'):
                        item.slice(item.search(/Content-Type:\s.+/gi) + item.match(/Content-Type:\s.+/gi)[0].length + 4, -4),
                };
            } else if (/name=".+"/g.test(item)){
                result[item.match(/name=".+"/gi)[0].slice(6, -1)] = item.slice(item.search(/name=".+"/gi) + item.match(/name=".+"/gi)[0].length + 4, -4);
            }
        });
    return result;
};
