const marked = require('marked');

module.exports = function (body) {
    if (body === null) {
        return {
            total: 0,
            remaining: 0
        };
    }

    let tokens = marked.lexer(body, { gfm: true });
    // flatten the nested tokens to make filtering easier
    let allTokens = tokens.flatMap(function mapper(token) {
        if (token.tokens && token.tokens.length > 1) {
            return token.tokens.flatMap(mapper);
        }

        return token.items && token.items.length ? token.items.flatMap(mapper) : [token];
    });
    // and filter down to just the task list items
    let listItems = allTokens.filter(token => token.type === 'list_item');
    let optionalItems = listItems.filter(item => item.text.indexOf('OPTIONAL') !== -1);

    // filter out skippable items, case sensitive
    let skippable = [
        'POST-MERGE',
        'N/A',
        'OPTIONAL', // this is a special case, we want to count these items but not include them in the remaining count
    ];
    listItems = listItems.filter(item => {
        return ! skippable.some(skip => item.text.indexOf(skip) !== -1) || item.text.indexOf('OPTIONAL') !== -1 && item.checked === true;
    });

    // return counts of task list items and how many are left to be completed
    return {
        total: listItems.filter(item => item.checked !== undefined).length,
        remaining: listItems.filter(item => item.checked === false).length,
        optionalRemaining: optionalItems.filter(item => item.checked === false).length
    };
};
