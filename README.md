Welcome to Probot on Glitch
=========================

This is the Glitch equivalent of running `create-probot-app` to generate a new probot app locally. Updates to your code will instantly deploy and update live.

---

## Getting Started

To get your own Glitch-hosted probot up-and-running:

1. Remix this project by clicking the **Remix This** button above.

2. Click the **New File** button (at left) and type `.data/private-key.pem`. Then click **Add File**.

3. [Configure a new app on Github](https://probot.github.io/docs/development/#configure-a-github-app). For the Homepage URL, use `https://www.example.com`. This will be replaced later.

4. Edit the `.env` file (at left) with your app credentials. `PRIVATE_KEY_PATH=` should be set to `.data/private-key.pem`. `NODE_ENV=` should be set to `production`.

5. Update the Webhook URL in your [Github app settings](https://github.com/settings/apps) to use the URL of the page that loads when you click the **Show** button at the top (ex. `https://your-project.glitch.me/probot`)

6. Wait for app to load.

---
      
#### About Glitch

**Glitch** is the friendly commmunity where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

Glitch is made by [Fog Creek](https://fogcreek.com/)
\ ゜o゜)ノ
