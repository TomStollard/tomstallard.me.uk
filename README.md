# [tomstollard.me.uk](https://tomstollard.me.uk)

This is the code behind tomstollard.me.uk, which is built using Docpad.

### To run:  
1. You'll need Node and npm to be installed
2. Install dependencies, by running `npm i`
3. Automagically compile the site and run a web server using `npm run run`

You'll need to use `docpad.cmd` instead of `docpad` on Windows, due to an bug, since a plain js docpad config file is being used, rather than coffeescript.
With the `npm run` commands, simply append `-win` to the command name to reference `docpad.cmd`.


### To compile the site for deployment:  
1. Run `npm run build` to remove existing files from development, and to generate the site in the correct mode
2. Copy contactsubmit/conf.example.php to contactsubmit/conf.php, and update options as required

### Setting up commenting system
1. These instructions are written for systemd-based Ubuntu, but should work fine on Debian as well. For security reasons, the installation of isso should be done under another user account - I made an account called isso.
2. This site uses the Isso commenting system - to start, follow the install instructions on the [isso](https://posativ.org/isso/docs/install/) site
3. Add a /etc/isso.conf file with the required options
4. Make the directory and file /var/lib/isso and /var/log/isso.log, and make both of these owned by the isso user
5. Copy the systemd service and socket files from [here](https://github.com/jgraichen/debian-isso/tree/master/debian), to /lib/systemd/systemd, and add the socket as a requirement of the service
6. Enable the isso service
7. Configure your reverse proxy, and set the isso_url variable in docpad.js

&copy; Tom Stollard 2016
