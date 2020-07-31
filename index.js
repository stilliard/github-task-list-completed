/* jslint esversion:8*/
const marked = require('marked');

const tasks = [
  "step 1",
  "step 2",
  "step 3"
];

const build_template = () => {
  let template = "\n<!-- start of DoD -->\n## Done is Done\n";
  for (let i in tasks) {
    template += `- [ ] ${tasks[i]}\n`;
  }
  template += "<!-- end of DoD -->";
  return template;
};

module.exports = (app) => {
  app.log('Yay! The app was loaded!');

  app.on(['pull_request.opened', 'pull_request.edited'], async context => {
    // append checks to body if they don't exist
    let body = context.payload.pull_request.body;

    if (!body.includes("<!-- end of DoD -->")) {
      body += build_template();
      // fix deprecation of number
      pull = context.issue({body});
      pull.pull_number = pull.number;
      delete pull.number;
      return context.github.pulls.update(pull);
    }
  });

  // watch for pull requests & their changes
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async context => {
    const startTime = (new Date()).toISOString();

    // lookup the pr body/description
    const pr = context.payload.pull_request;
    const body = pr.body;

    const tokens = marked.lexer(body, { gfm: true });
    const listItems = tokens.filter(token => token.type === 'list_item_start');
    
    // check if it contains any not checked task list items
    const hasOutstandingTasks = listItems.some(item => item.checked === false);

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
