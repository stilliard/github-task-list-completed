const checkOutstandingTasks = require('./src/check-outstanding-tasks');

module.exports = (app) => {
  app.log('Yay! The app was loaded!');

  // watch for pull requests & their changes
  app.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'issue_comment', // for comments on github issues
    'pull_request_review', // reviews
    'pull_request_review_comment', // comment lines on diffs for reviews
  ], async context => {
    const startTime = (new Date).toISOString();

    // lookup the pr
    let pr = context.payload.pull_request;

    // check if this is an issue rather than pull event
    if (context.event == 'issue_comment' && ! pr) {
      // if so we need to make sure this is for a PR only
      if (! context.payload.issue.pull_request) {
        return;
      }
      // & lookup the PR it's for to continue
      let response = await context.github.pulls.get(context.repo({
        pull_number: context.payload.issue.number
      }));
      pr = response.data;
    }

    let outstandingTasks = checkOutstandingTasks(pr.body);

    // lookup comments on the PR
    let comments = await context.github.issues.listComments(context.repo({
      per_page: 100,
      issue_number: pr.number
    }));

    // as well as review comments
    let reviewComments = await context.github.pulls.listReviews(context.repo({
      per_page: 100,
      pull_number: pr.number
    }));
    if (reviewComments.data.length) {
      comments.data = comments.data.concat(reviewComments.data);
    }

    // and diff level comments on reviews
    let reviewDiffComments = await context.github.pulls.listComments(context.repo({
      per_page: 100,
      pull_number: pr.number
    }));
    if (reviewDiffComments.data.length) {
      comments.data = comments.data.concat(reviewDiffComments.data);
    }

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
      head_sha: pr.head.sha,
      started_at: startTime,
      status: 'in_progress',
      output: {
        title: (outstandingTasks.total - outstandingTasks.remaining) + ' / ' + outstandingTasks.total + ' tasks completed',
        summary: outstandingTasks.remaining + ' task' + (outstandingTasks.remaining > 1 ? 's' : '') + ' still to be completed',
        text: 'We check if any task lists need completing before you can merge this PR'
      }
    };

    // all finished?
    if (outstandingTasks.remaining === 0) {
      check.status = 'completed';
      check.conclusion = 'success';
      check.completed_at = (new Date).toISOString();
      check.output.summary = 'All tasks have been completed';
    };

    // send check back to GitHub
    return context.github.checks.create(context.repo(check));
  });
};
