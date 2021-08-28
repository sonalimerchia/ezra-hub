# Hub for Ezra Messaging

Interacts with Mac messaging capability to send messages from your iCloud account as if in an individual thread with each desired contact.

Controlled from mobile app

Steps to set up this project:

1. Clone from git
2. Go to `System Preferences > Security & Privacy > Privacy > Full Disk Access` and grant the terminal full disk access so it can access your messages database
3. Run `yarn install`
4. Run `sh setup.sh <account-key>` where your account key is the code on the bottom of the homescreen once you create an account/log in on the mobile app
5. Run `sh start.sh` to start the hub
   - May want to set this as a startup script depending on usage
