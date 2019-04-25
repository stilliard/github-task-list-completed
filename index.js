module.exports = (app) => {

  app.log('Yay! The app was loaded!');

  // watch for pull requests & their changes
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async context => {
    
    // lookup the pr body/description
    const pr = context.payload.pull_request;
    const body = pr.body;
    
    // check if it contains any not checked task list items
    let check = {
      name: 'task-list-completed',
      head_branch: '', // workaround for https://github.com/octokit/rest.js/issues/874
      head_sha: pr.head.sha,
      status: 'in_progress',
      started_at: new Date(newStatus.timeStart).toISOString(),
    };
    if (body.includes("- [ ] ")) {
      // if it does, send a failed status
      params = context.issue({body: 'Hello World!'});
    } else {    
      // otherwise, send a success status
      params = context.issue({body: 'Hello World!'});
    }

    // Send status back to GitHub
    return context.github.checks.create(context.repo(check));
  });
};
