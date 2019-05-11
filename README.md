<img style="width: 140px; display: block; margin: 0 auto;" src="https://cdn3.iconfinder.com/data/icons/flat-office-icons-1/140/Artboard_1-4-512.png">

GitHub - Task list completed PR check
=========================

Install from the Marketplace: https://github.com/marketplace/task-list-completed

Check a pull request body for task lists & make sure they are all completed.
The check will not pass until all task lists have been checked.

You can use this to check manual tests or requirements have been ticked off before the pull request can be merged.

Find out more about GitHub task lists: https://help.github.com/en/articles/about-task-lists

## Docs

Install & add to the repos you want.

Want to require tasks to be complete before it can be merged?

Inside your GitHub repo > Settings > Branches > Branch protection rules > Add rule > select require checks & require this check to pass.

By default, we mark the check as in_progress until all tasks pass and then it marks it as successful.

## TODO

- [ ] unit tests & travis CI
- [ ] Submit to https://github.com/probot/probot.github.io/blob/master/.github/app-review-process.md
- [ ] Add config to allow changing from in_progress to completed but with a failure or neutral conclsion if needed -> https://probot.github.io/api/latest/classes/context.html#config
- [ ] Finish docs, e.g. about using a .github/task-list.yml for above

## Contributing

For now, on Glitch you can click to "remix to edit" and then work on your own forked version.
Then if you have ideas to bring over, you can submit an issue to discuss them or a pull request with the code changes.
Thank you.

## Development for main repo

Code runs on Glitch, `git push glitch` & then in glitch, click tools > console and run `refresh`.
Permission changes would need to be changed in the app on github.

## Security

The code is all here to see & available on the Glitch link below which is also where the service runs.
No data about your user or repo is logged.

If you discover a security issue please email it to myself at andrew@stapps.io and I will get back to you asap. For all other issues or help you can create an issue on this project - Thank you.

## Credits 
- [Glitch Probot](https://github.com/probot/probot) - Used to build this project
- [Glitch](https://glitch.com/) - Used as an online editor & to host the service
- [WIP](https://github.com/wip/app) - Inspiration for this project
- [Juliia Osadcha / iconfinder](https://www.iconfinder.com/icons/1790658/checklist_checkmark_clipboard_document_list_tracklist_icon) Icon used for this project 

#### About Glitch

This repo is hosted with Glitch: https://glitch.com/edit/#!/task-list-completed

**Glitch** is the friendly commmunity where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).
\ ゜o゜)ノ
