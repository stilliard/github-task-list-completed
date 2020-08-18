const marked = require('marked');

module.exports = function (body) {
    if (body === null) {
        return {
            total: 0,
            remaining: 0
        };
    }

    let tokens = marked.lexer(body, { gfm: true });
    let listItems = tokens.filter(token => token.type === 'list_item_start');

    // return counts of task list items and how many are left to be completed
    return {
        total: listItems.filter(item => item.checked !== undefined).length,
        remaining: listItems.filter(item => item.checked === false).length
    };
};
