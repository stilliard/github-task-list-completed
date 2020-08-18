const marked = require('marked');

module.exports = function (body) {
    if (body === null) {
        return false;
    }
    let tokens = marked.lexer(body, { gfm: true });
    let listItems = tokens.filter(token => token.type === 'list_item_start');

    // check if it contains any not checked task list items
    return listItems.some(item => item.checked === false);
};
