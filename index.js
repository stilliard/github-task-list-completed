module.exports = (app) => {
  app.log('Yay! The app was loaded!');

  // watch for pull requests & their changes
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async context => {
    const startTime = (new Date).toISOString();

    // lookup the pr body/description
    const pr = context.payload.pull_request;
    const body = pr.body;
    
    // check if it contains any not checked task list items
    const hasOutstandingTasks = body.includes("- [ ] ");

    // send check back to GitHub
    return context.github.checks.create(context.repo({
      name: 'task-list-completed',
      head_branch: '', // workaround for https://github.com/octokit/rest.js/issues/874
      head_sha: pr.head.sha,
      status: 'completed',
      conclusion: hasOutstandingTasks ? 'failure' : 'success',
      started_at: startTime,
      completed_at: (new Date).toISOString(),
      output: {
        title: hasOutstandingTasks ? 'Outstanding tasks' : 'Tasks completed',
        summary: hasOutstandingTasks ? 'Tasks still remain to be completed' : 'All tasks have been completed',
        text: 'We check if any task lists need completing before you can merge this PR'
      }
    }));
  });
};
