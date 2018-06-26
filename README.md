Welcome to Probot on Glitch
=========================

This is the Glitch equivalent of running `create-probot-app` to generate a new probot app locally. Updates to your code will instantly deploy and update live.

---

## Getting Started

To get your own Glitch-hosted Probot up-and-running, follow these steps. If you need more detail, the [Probot Docs](https://probot.github.io/docs/development/#configuring-a-github-app) are a great place to go to learn more.

1. [Configure a new app on Github](https://github.com/settings/apps/new).
    - Hit the "Show" button on the top left of this page to find the URL. It will look something like `https://random-word.glitch.me/probot`, except the domain will be specific to your app.
    - For the Webhook URL, use this URL (again, updating the domain to match yours): `https://random-word.glitch.me/`. Notice that we left off the `/probot`.
    - For the Webhook Secret, just use "development".
    until Step 4.
    - Save your changes.
    - On the **Permissions & webhooks** tab, add read and write permissions for issues.
    - On the **Permissions & webhooks** tab, subscribe to **Issues** events.
    - Save your changes.
    - On the configuration page that comes up after saving, download your private key. It will be saved into a file named `my-app-name.2018-06-20.private-key.pem`, with your app name, and today's date.

2. Click the **Install** tab, and install your app into one of your repositories.

3. Click the **New File** button (at left) and type `.data/private-key.pem`. Then click **Add File**. Open a terminal, and from your download folder run `cat my-app-name.2018-06-20.private-key.pem | pbcopy` (except using your app's name and today's date). In the new file in Glitch, paste the contents of the clipboard.

4. Edit the `.env` file (at left) with your app credentials. 
    - `APP_ID` can be found in the About section of your Github app.
    - `WEBHOOK_SECRET` is the value you generated in Step 2.
    - `PRIVATE_KEY_PATH=` should be set to `.data/private-key.pem`. 
    - `NODE_ENV=` should be set to `production`. 

5. Wait for app to load. A green `Live` label should show up next to the **Show** button when it's finished loading.

6. Open a new issue in the repo where you installed your app, and watch for your app to reply!

5. Head back to our [Webhook Docs](https://probot.github.io/docs/webhooks/) to learn how to start building your app.
---
      
#### About Glitch

**Glitch** is the friendly commmunity where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

Glitch is made by [Fog Creek](https://fogcreek.com/)
\ ゜o゜)ノ
