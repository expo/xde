### I'm getting an error about running untrusted code and I can't open the app.

Try downloading the latest copy of XDE and reinstalling. We've resolved this issue.

### I'm seeing a message that XDE is waiting for the packager and ngrok to load, and I see a "packager ready" message, but it's still waiting.

There might be a problem with ngrok. The most common problem we've seen is that we use ngrok 1 and sometimes if you have ngrok 2 on your system, it can leave incompatible configuration files around. Try deleting `~/.ngrok` and then reopening XDE.

