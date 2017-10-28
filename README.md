Welcome to Probot on Glitch
=========================

This is the Glitch equivalent of running `create-probot-app` to generate a new probot app locally. Updates to your code will instantly deploy and update live.

---

## Getting Started

To get your own Glitch-hosted Probot up-and-running:

1. [Configure a new app on Github](https://github.com/settings/apps/new).
    - For the Homepage URL, you can use your repository URL or website URL. 
    - For the Webhook URL, use `https://www.example.com`. This will be replaced     later.
    - For the Webhook Secret, open a terminal and run `openssl rand -base64 32`. Copy/paste the outputted value to the Webhook Secret box. Keep this handy
    until Step 4.
    - Choose the permissions you want to give your bot based on what you want to build (ex. issues bot, PR bot, hybrid).
    - Download your private key.
    - Save your changes.

2. Click the **New File** button (at left) and type `.data/private-key.pem`. Then click **Add File**. Open the private key you downloaded from Github, and copy/paste the contents into your new file.

3. Edit the `.env` file (at left) with your app credentials. 
    - `APP_ID` can be found in the About section of your Github app.
    - `WEBHOOK_SECRET` is the value you generated in Step 2.
    - `PRIVATE_KEY_PATH=` should be set to `.data/private-key.pem`. 
    - `NODE_ENV=` should be set to `production`. 

4. Wait for app to load. A green `Live` label should show up next to the **Show** button when it's finished loading.

---
      
#### About Glitch

**Glitch** is the friendly commmunity where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

Glitch is made by [Fog Creek](https://fogcreek.com/)
\ ゜o゜)ノ
