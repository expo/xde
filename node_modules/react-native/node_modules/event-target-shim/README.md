# event-target-shim

[![npm version](https://badge.fury.io/js/event-target-shim.svg)](http://badge.fury.io/js/event-target-shim)

A polyfill for W3C EventTarget, plus few extensions.

See Also: https://dom.spec.whatwg.org/#interface-eventtarget


## Overview

- This module provides `EventTarget` constructor that is possible to inherit for
  your custom object.
- This module provides an utility in order to define properties for attribute
  listeners (e.g. `obj.onclick`).

If `window.EventTarget` exists, `EventTarget` is inherit from
`window.EventTarget`.
In short, `obj instanceof window.EventTarget === true`.

```ts
declare class EventTarget {
  constructor();
  addEventListener(type: string, listener: (event: Event) => void, capture?: boolean): void;
  removeEventListener(type: string, listener: (event: Event) => void, capture?: boolean): void;
  dispatchEvent(event: Event): void;
}

// Define EventTarget type with attribute listeners.
declare function EventTarget(...types: string[]): typeof EventTarget;
```


## Installation

```
npm install event-target-shim
```


## Usage

```js
import EventTarget from "event-target-shim";

class YourCoolType extends EventTarget {
  // ...
}

// This prototype has getters/setters of `onmessage` and `onerror`.
class YourAwesomeType extends EventTarget("message", "error") {
  // ...
}
```

I prefer use together with [Browserify](http://browserify.org).

But we can use together with [RequireJS](http://requirejs.org/), instead.
In this case, please download a file from dist directory of repo.

```js
define("MagicalBox", ["event-target-shim"], function (EventTarget) {
  function MagicalBox() {
    EventTarget.call(this);
  }

  MagicalBox.prototype = Object.create(EventTarget.prototype, {
    constructor: {
      value: MagicalBox,
      configurable: true,
      writable: true
    },

    // ...
  });

  return MagicalBox;
});
```
