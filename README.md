<p align="center"><img width="140" src="https://cdn3.iconfinder.com/data/icons/flat-office-icons-1/140/Artboard_1-4-512.png"></p>


GitHub - Task list completed PR check
=========================

Install from the Marketplace: https://github.com/marketplace/task-list-completed

Check a pull request body for task lists / checkboxes / tickboxes & make sure they are all completed.
The check will not pass until all task lists have been checked.

**Mark it as a required check to preventing merging the PR until all tasks in a PR have been ticked off.**

You can use this to check manual tests or requirements have been ticked off before the pull request can be merged.

E.g. Say you add some tasks like so
```
- [x] Check the size looks good on the front end
- [ ] Check the image is centered
```

& they display like this to be ticked off as tests:

![](./screenshots/example-pr.png)

this will show the check as pending as only 1 of the tasks is completed s (same if none etc.):

![](./screenshots/tasks-remaining.png)

Once all tasks are marked off it'll show as completed:

![](./screenshots/tasks-completed.png)


Also when viewing all Pull Requests, you'll see the green tick when all completed:
![](./screenshots/success-pr.png)

& an orange dot when still tasks todo:
![](./screenshots/pending-pr.png)

& if you have other CI tests such as unit tests etc, our pending status will not get in the way of failing tests, they will still show as the red cross:
![](./screenshots/failing-pr.png)


Find out more about GitHub task lists: https://help.github.com/en/articles/about-task-lists

<br>
<a href="https://m.do.co/c/60c76a17a70d">
    <img src="https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/PoweredByDO/DO_Powered_by_Badge_blue.svg" alt="Powered By DO" width="201px">
</a>

<small>This project is supported by & hosted on Digital Ocean, thanks!</small>

## Docs

Install & add to the repos you want.

Want to require tasks to be complete before it can be merged?

Inside your GitHub repo > Settings > Branches > Branch protection rules > Add rule > select require checks & require this check to pass.

By default, we mark the check as in_progress until all tasks pass and then it marks it as successful.

## Skippable tasks

Tasks that contain "POST-MERGE" or "N/A" in all caps are skipped. This is useful for tasks that are not applicable to the PR, or tasks that are only applicable after the PR is merged.
This was inspired by [another project here](https://github.com/Shopify/task-list-checker/tree/main?tab=readme-ov-file#in-a-pull-request). 

## Optional tasks

Tasks that contain "OPTIONAL" in all caps are also skipped unless checked, they are also added to an "(+X optional)" text in the check. This is useful for tasks that are not required to be completed before the PR can be merged.

## Contributing / Development

Code previous ran on Glitch, now it's hosted on Digital Ocean.
Hosting is via multiple droplets, one configured as a load balancer & then additional worker nodes/droplets for the actual checks to run on.

*For previous glitch deployments, on the glitch page, click tools > console and then run `git pull origin master && refresh`.
Permission changes would need to be changed in the app on github.*

### Local development

Using node v18+ & npm 10+ (older versions may also work, your mileage may vary).

Local development can be done by cloning this repo:
```bash
git clone https://github.com/stilliard/github-task-list-completed.git
cd github-task-list-completed
```

Setup up an App inside GitHub:
https://github.com/settings/apps/

Install & run:

```bash
npm install
npm run dev
```

Load up http://localhost:3000/probot and follow intructions to set up the app.
On first run, it will create your `.env` with an initial `WEBHOOK_PROXY_URL=xxxxx`.
After following the set up, make sure you have `APP_ID`, `PRIVATE_KEY`, `WEBHOOK_SECRET` all set.
You can change the port it runs on with `PORT=3001` for example and set a `NODE_ENV=production` for production logs, [more details about logs here](https://probot.github.io/docs/logging/).

<a href="https://probot.github.io/docs/">
    View full Probot docs here.
    <br>
    <img src="https://probot.github.io/assets/img/logo.png" width="80">
</a>

<br>

Testing:
```bash
npm test
```

For production:
```bash
npm install --omit=dev
npm start
```

Instead of `npm start`, typically in production you'll use a [service file to run via systemd](https://www.freedesktop.org/software/systemd/man/latest/systemd.syntax.html) or similar. 
e.g.
```systemd
[Service]
ExecStart=npm start
WorkingDirectory=/srv/github-task-list-completed
Restart=always

[Install]
WantedBy=multi-user.target
```

You can also help support the hosting and development of this project with coffee power:

<a href="https://www.buymeacoffee.com/stilliard" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>

## Security

All code is Open source, [MIT license](./LICENSE). Production checks currently log repo name & PR ID for debug purposes only and logs are removed after a max of 7 days.
No logs are recorded about your repos themselves nor the pull request contents.

Hosted check is on DO's [SFO3](https://www.digitalocean.com/blog/introducing-a-new-datacenter-in-the-san-francisco-region-sfo3).

If you discover a security issue please email it to myself at andrew@stapps.io and I will get back to you asap. For all other issues or help you can create an issue on this project - Thank you.

## Credits 

- [Probot](https://github.com/probot/probot) - Used to build this project
- [Glitch](https://glitch.com/) - Previously used to start this project
- [WIP](https://github.com/wip/app) - Inspiration for this project
- [Juliia Osadcha / iconfinder](https://www.iconfinder.com/icons/1790658/checklist_checkmark_clipboard_document_list_tracklist_icon) Icon used for this project
- [DigitalOcean](https://m.do.co/c/60c76a17a70d) - Hosting of the live app check
