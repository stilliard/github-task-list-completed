// Tests use Jest by default.
// To read more about testing with Probot, visit https://probot.github.io/docs/testing/

const checkOutstandingTasks = require('../src/check-outstanding-tasks');
const nock = require('nock');
const { Probot, ProbotOctokit } = require('probot');
const app = require('../index.js')

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

test('Test nested lists', () => {
    let markdown = `
Hello World
- [x] normal
- section1
   - [x] task 1-1
   - [ ] task 1-2
- section2
   - [ ] task 2-1
   - [x] task 2-2
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(5);
    expect(results.remaining).toBe(2);
});

test('Test skip items', () => {
    let markdown = `
Hello World
- normal
- [ ] task one
- [ ] POST-MERGE: abc
- [ ] this is not a post-merge test
- [ ] N/A skipped
- [x] n/a not skipped
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(3);
    expect(results.remaining).toBe(2);
});

test('Test optional items', () => {
    let markdown = `
Hello World
- normal
- [x] OPTIONAL: one
- [ ] OPTIONAL: two
- [x] this is not an optional test
`;
    let results = checkOutstandingTasks(markdown);
    expect(results.total).toBe(2);
    expect(results.remaining).toBe(0);
    expect(results.optionalRemaining).toBe(1);
});

describe('ignores bot checkbox comments across all comment types', () => {
    let probot;
    beforeEach(() => {
        nock.disableNetConnect();
        probot = new Probot({
            githubToken: 'test',
            Octokit: ProbotOctokit.defaults({
                retry: { enabled: false },
                throttle: { enabled: false },
            }),
        });
        probot.load(app);
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    const owner = 'octo';
    const repo = 'repo';
    const prNumber = 1;

    test.each([
        'linear',
        'linear[bot]',
        'coderabbitai[bot]',
    ])('ignores checkbox comments from %s', async (botLogin) => {
        const botComment = { user: { login: botLogin }, body: '- [ ] bot task' };
        let capturedTitle;

        nock('https://api.github.com')
            .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`).query(true).reply(200, [botComment])
            .get(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`).query(true).reply(200, [botComment])
            .get(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`).query(true).reply(200, [botComment])
            .post(`/repos/${owner}/${repo}/check-runs`, (body) => {
                capturedTitle = body.output.title;
                return true;
            })
            .reply(201, {});

        await probot.receive({
            name: 'pull_request',
            payload: {
                action: 'opened',
                pull_request: {
                    number: prNumber,
                    body: '- [ ] human task',
                    user: { login: 'devuser' },
                    head: { repo: { full_name: `${owner}/${repo}` } },
                },
                repository: { owner: { login: owner }, name: repo },
            },
        });

        expect(capturedTitle).toBe('0 / 1 tasks completed');
    });
});
