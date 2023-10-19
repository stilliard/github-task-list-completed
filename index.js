const checkOutstandingTasks = require('./src/check-outstanding-tasks');

const ENABLE_ID_LOGS = true; // Repo name & ID only for logs, no private data logged! (Repo name only needed to help with issue reports & debugging).

module.exports = (app) => {
  app.log('Yay! The app was loaded!');

  // watch for pull requests & their changes
  app.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'issue_comment', // for comments on GitHub issues
    'pull_request_review', // reviews
    'pull_request_review_comment', // comment lines on diffs for reviews
  ], async context => {

    // log helper
    function log(pr, message, type = 'info') {
      if (ENABLE_ID_LOGS) {
        context.log[type](`PR ${pr.head.repo.full_name}#${pr.number}: ${message}`);
      }
    }

    // lookup the pr
    let pr = context.payload.pull_request;

    // check if this is an issue rather than pull event
    if (context.name == 'issue_comment' && ! pr) {
      // if so we need to make sure this is for a PR only
      if (! context.payload.issue.pull_request) {
        return;
      }
      // & lookup the PR it's for to continue
      try {
        let response = await context.octokit.pulls.get(context.repo({
          pull_number: context.payload.issue.number
        }));
        pr = response.data;
        // cleanup
        response = null;
      } catch (err) {
        context.log.error(`Error looking up PR, skipping. Error (${err.status}): ${err.message}`);
      }
    }
    if (! pr) {
      context.log.error(`Not on a PR? Skipping. context.name: ${context.name}`);
      return;
    }

    log(pr, `Request received [Context: ${context.id}]`);

    let prBody = pr.body;
    
    // if the author is a renovate bot, ignore checks
    // https://www.mend.io/free-developer-tools/renovate/
    if (pr.user.login.indexOf('renovate[bot]') !== -1) {
      prBody = null;
    }
    
    let outstandingTasks = checkOutstandingTasks(prBody);


    // lookup comments on the PR
    let comments;
    try {
      comments = await context.octokit.issues.listComments(context.repo({
        per_page: 100,
        issue_number: pr.number
      }));

      // bots to ignore
      let bots = [
        'linear', // ref https://github.com/stilliard/github-task-list-completed/issues/33
        'linear[bot]',
      ];
      // filter out comments from the bot
      comments.data = comments.data.filter(comment => {
        return ! bots.includes(comment.user.login);
      });
      // cleanup
      bots = null;

    } catch (err) {
      if (err.status === 403) { // if we don't have access to the repo, skip entirely
        log(pr, `No access, skipping entirely. Error (${err.status}): ${err.message}`, 'error');
        return;
      }
      log(pr, `Error looking up comments, skipping. Error (${err.status}): ${err.message}`, 'error');
    }

    log(pr, 'Main comments api lookup complete');

    // as well as review comments
    let reviewComments;
    try {
      reviewComments = await context.octokit.pulls.listReviews(context.repo({
        per_page: 100,
        pull_number: pr.number
      }));
      if (reviewComments.data.length) {
        comments.data = comments.data.concat(reviewComments.data);
      }
      // cleanup
      reviewComments = null;
    } catch (err) {
      log(pr, `Error looking up review comments, skipping. Error (${err.status}): ${err.message}`, 'error');
    }

    log(pr, 'Review comments api lookup complete');

    // and diff level comments on reviews
    try {
      let reviewDiffComments = await context.octokit.pulls.listReviewComments(context.repo({
        per_page: 100,
        pull_number: pr.number
      }));
      if (reviewDiffComments.data.length) {
        comments.data = comments.data.concat(reviewDiffComments.data);
      }
      // cleanup
      reviewDiffComments = null;
    } catch (err) {
      log(pr, `Error looking up review diff comments, skipping. Error (${err.status}): ${err.message}`, 'error');
    }

    log(pr, 'Diff comments api lookup complete');

    // & check them for tasks
    if (comments && comments.data && comments.data.length) {
      comments.data.forEach(function (comment) {
        let commentOutstandingTasks = checkOutstandingTasks(comment.body);
        outstandingTasks.total += commentOutstandingTasks.total;
        outstandingTasks.remaining += commentOutstandingTasks.remaining;
        outstandingTasks.optionalTotal += commentOutstandingTasks.optionalTotal;
        outstandingTasks.optionalRemaining += commentOutstandingTasks.optionalRemaining;
        outstandingTasks.tasks = (outstandingTasks.tasks || []).concat(commentOutstandingTasks.tasks || []);
        outstandingTasks.optionalTasks = (outstandingTasks.optionalTasks || []).concat(commentOutstandingTasks.optionalTasks || []);
      });
    }

    // optional addon text
    let optionalText = '';
    if (outstandingTasks.optionalRemaining > 0) {
      optionalText = ' (+' + outstandingTasks.optionalRemaining + ' optional)';
    }

    // make a markdown table of the tasks
    let tasksTable = '';
    if (outstandingTasks.total > 0) {
      tasksTable += `
## Required Tasks
| Task | Status |
| ---- | ------ |
${outstandingTasks.tasks.map(task => `| ${task.task} | ${task.status} |`).join('\n')}
`;
    }
    if (outstandingTasks.optionalTotal > 0) {
      tasksTable += `
## Optional Tasks
| Task | Status |
| ---- | ------ |
${outstandingTasks.optionalTasks.map(task => `| ${task.task} | ${task.status} |`).join('\n')}
`;
    }

    let check = {
      name: 'task-list-completed',
      head_branch: '',
      head_sha: pr.head.sha,
      started_at: (new Date).toISOString(),
      status: 'in_progress',
      output: {
        title: (outstandingTasks.total - outstandingTasks.remaining) + ' / ' + outstandingTasks.total + ' tasks completed' + optionalText,
        summary: outstandingTasks.remaining + ' task' + (outstandingTasks.remaining > 1 ? 's' : '') + ' still to be completed' + optionalText,
        text: tasksTable
      },
      request: {
        // timeout the request after 3 minutes
        timeout: 1000 * 60 * 3,
        // retry up to 10 times on request timeouts
        retries: 10,
        retryAfter: 10, // wait 10 seconds
      },
    };

    // all finished?
    if (outstandingTasks.remaining === 0) {
      check.status = 'completed';
      check.conclusion = 'success';
      check.completed_at = (new Date).toISOString();
      check.output.summary = 'All tasks have been completed' + optionalText;
    };

    log(pr, 'Complete and sending back to GitHub');

    // cleanup
    prBody = null;
    outstandingTasks = null;
    comments = null;
    tasksTable = null;
    optionalText = null;

    // send check back to GitHub
    try {
      const response = await context.octokit.checks.create(context.repo(check));
      log(pr, `Check response status from GitHub ${response.status} [X-GitHub-Request-Id: ${response.headers['x-github-request-id']}]`);
    } catch (err) {
      log(pr, `Error sending check back to GitHub. Error (${err.status}): ${err.message}`, 'error');
    }

    return;
  });
};
