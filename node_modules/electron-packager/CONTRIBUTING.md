## Before opening bug reports/technical issues:

Please provide **all of the following information** in your new issue (use this as a template):

- Which version of electron-packager are you using?
- What cli arguments are you passing?
- What platform are you running electron-packager on? What platform(s) are you building for?
- Is there a stack trace in the error message you're seeing?
- If possible, please provide instructions to reproduce your problem

Thanks!

## For Collaborators

Make sure to get a `:thumbsup:`, `+1` or `LGTM` from another collaborator before merging a PR.

Release process:

- if you aren't sure if a release should happen, open an issue
- make sure the tests pass
- `npm version <major|minor|patch>`
- `git push && git push --tags` (or `git push` with `git config --global push.followTags true` on latest git)
- `npm publish`
