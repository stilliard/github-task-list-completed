const checkOutstandingTasks = require('./src/check-outstanding-tasks');

const ENABLE_ID_LOGS = true; // Repo name & ID only for logs, no private data logged! (Repo name only needed to help with issue reports & debugging).

module.exports = (app) => {
  app.log('Yay! The app was loaded!');

  // log helper
  function log(pr, message) {
    if (ENABLE_ID_LOGS) {
      app.log(`PR ${pr.head.repo.full_name}#${pr.number}: ${message}`);
    }
  }

  // watch for pull requests & their changes
  app.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'issue_comment', // for comments on GitHub issues
    'pull_request_review', // reviews
    'pull_request_review_comment', // comment lines on diffs for reviews
  ], async context => {

    // lookup the pr
    let pr = context.payload.pull_request;

    // check if this is an issue rather than pull event
    if (context.name == 'issue_comment' && ! pr) {
      // if so we need to make sure this is for a PR only
      if (! context.payload.issue.pull_request) {
        return;
      }
      // & lookup the PR it's for to continue
      let response = await context.octokit.pulls.get(context.repo({
        pull_number: context.payload.issue.number
      }));
      pr = response.data;
    }
    if (! pr) {
      app.log('[error] not on a PR?');
      return;
    }

    log(pr, 'Request received');

    let prBody = pr.body;
    
    // if the author is a renovate bot, ignore checks
    // https://www.mend.io/free-developer-tools/renovate/
    if (pr.user.login.indexOf('renovate[bot]') !== -1) {
      prBody = null;
    }
    
    let outstandingTasks = checkOutstandingTasks(prBody);


    // lookup comments on the PR
    let comments = await context.octokit.issues.listComments(context.repo({
      per_page: 100,
      issue_number: pr.number
    }));

    log(pr, 'Main comments api lookup complete');

    // as well as review comments
    let reviewComments = await context.octokit.pulls.listReviews(context.repo({
      per_page: 100,
      pull_number: pr.number
    }));
    if (reviewComments.data.length) {
      comments.data = comments.data.concat(reviewComments.data);
    }

    log(pr, 'Review comments api lookup complete');

    // and diff level comments on reviews
    let reviewDiffComments = await context.octokit.pulls.listReviewComments(context.repo({
      per_page: 100,
      pull_number: pr.number
    }));
    if (reviewDiffComments.data.length) {
      comments.data = comments.data.concat(reviewDiffComments.data);
    }

    log(pr, 'Diff comments api lookup complete');

    // & check them for tasks
    if (comments.data.length) {
      comments.data.forEach(function (comment) {
        let commentOutstandingTasks = checkOutstandingTasks(comment.body);
        outstandingTasks.total += commentOutstandingTasks.total;
        outstandingTasks.remaining += commentOutstandingTasks.remaining;
      });
    }

    let check = {
      name: 'task-list-completed',
      head_branch: '',
      head_sha: pr.head.sha,
      started_at: (new Date).toISOString(),
      status: 'in_progress',
      output: {
        title: (outstandingTasks.total - outstandingTasks.remaining) + ' / ' + outstandingTasks.total + ' tasks completed',
        summary: outstandingTasks.remaining + ' task' + (outstandingTasks.remaining > 1 ? 's' : '') + ' still to be completed',
        text: 'We check if any task lists need completing before you can merge this PR'
      },
      request: {
        retries: 3,
        retryAfter: 3,
      },
    };

    // all finished?
    if (outstandingTasks.remaining === 0) {
      check.status = 'completed';
      check.conclusion = 'success';
      check.completed_at = (new Date).toISOString();
      check.output.summary = 'All tasks have been completed';
    };

    log(pr, 'Complete and sending back to GitHub');

    // send check back to GitHub
    const response = await context.octokit.checks.create(context.repo(check));
    log(pr, `Check response status from GitHub ${response.status}`);

    return;
  });
};
