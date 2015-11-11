# git-info-async
Returns the git info for a given directory

Example:
```js
    nesh*> .require .
    gitInfoAsync = require("/Users/ccheever/projects/git-info-async")
    nesh*> yield gitInfoAsync()
    { rev: 'ff917da600a3b2f4956fec45ea0b2865bc6dc0a0' }

```
