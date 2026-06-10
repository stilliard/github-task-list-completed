const BOTS_TO_IGNORE = new Set([
  'linear', // ref https://github.com/stilliard/github-task-list-completed/issues/33
  'linear[bot]',
  'coderabbitai[bot]',
]);

module.exports = (comment) => {
  return BOTS_TO_IGNORE.has(comment?.user?.login ?? "");
}
