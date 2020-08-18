// Tests use Jest by default.
// To read more about testing with Probot, visit https://probot.github.io/docs/testing/

const checkOutstandingTasks = require('../src/check-outstanding-tasks');
test('Test outstanding tasks found', () => {
    let markdown = `
Hello World
- [ ] testing
- [x] 123
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(2);
    expect(results.remaining).toBe(1);
});

test('Test no outstanding tasks', () => {
    let markdown = `
Hello World
- [x] testing
- [x] 123
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(2);
    expect(results.remaining).toBe(0);
});

test('Test no tasks', () => {
    let markdown = `
Hello World
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(0);
    expect(results.remaining).toBe(0);
});

test('Test dont count normal lists', () => {
    let markdown = `
Hello World
- normal
- [x] task 1
- [ ] task 2
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(2);
    expect(results.remaining).toBe(1);
});
