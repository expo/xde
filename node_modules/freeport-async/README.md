# freeport

Finds an available port for your application to use.
You can specify a range where to look for an available port.
And can also find a range of available ports for you to use.
You can also be used to test to see if a given port is available.

All functions are async and return Promises.


Usage:
```js
    var freeportAsync = require('freeport-async');

    var portICanUse = await freeportAsync();

    var portIn9000Range = await freeportAsync(9000);

    var isPort5000Available = await freeportAsync.availableAsync(5000);

    var listOf5ConsecutiveAvailablePorts = await freeportAsync.rangeAsync(5);

    var freeRangeIn12000Range = await freeportAsync.rangeAsync(3, 12000);

```

See also https://gist.github.com/mikeal/1840641

