// Tests use Jest by default.
// To read more about testing with Probot, visit https://probot.github.io/docs/testing/

const checkOutstandingTasks = require('../src/check-outstanding-tasks');
test('Test outstanding tasks found', () => {
    let markdown = `
Hello World
- [ ] testing
- [x] 123
`;
    expect(checkOutstandingTasks(markdown)).toBe(true);
});
test('Test no outstanding tasks', () => {
    let markdown = `
Hello World
- [x] testing
- [x] 123
`;
    expect(checkOutstandingTasks(markdown)).toBe(false);
});
