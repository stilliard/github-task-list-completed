const checkOutstandingTasks = require('./src/check-outstanding-tasks');

module.exports = (app) => {
  app.log('Yay! The app was loaded!');

  // watch for pull requests & their changes
  app.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'issue_comment', // for comments on github issues
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

    let hasOutstandingTasks = checkOutstandingTasks(pr.body);

    // lookup comments on the PR
    let comments = await context.github.issues.listComments(context.repo({
      issue_number: pr.number
    }));

    // as well as review comments
    let reviewComments = await context.github.pulls.listComments(context.repo({
      pull_number: pr.number
    }));
    if (reviewComments.data.length) {
      comments.data = comments.data.concat(reviewComments.data);
    }

    // & check them for tasks
    if (comments.data.length) {
      comments.data.forEach(function (comment) {
        if (checkOutstandingTasks(comment.body)) {
          hasOutstandingTasks = true;
        }
      });
    }

    let check = {
      name: 'task-list-completed',
      head_sha: pr.head.sha,
      started_at: startTime,
      status: 'in_progress',
      output: {
        title: 'Outstanding tasks',
        summary: 'Tasks still remain to be completed',
        text: 'We check if any task lists need completing before you can merge this PR'
      }
    };

    // all finished?
    if (hasOutstandingTasks === false) {
      check.status = 'completed';
      check.conclusion = 'success';
      check.completed_at = (new Date).toISOString();
      check.output.title = 'Tasks completed';
      check.output.summary = 'All tasks have been completed';
    };

    // send check back to GitHub
    return context.github.checks.create(context.repo(check));
  });
};
