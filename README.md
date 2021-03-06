```
           __               ____          ____
      ____/ /__  ____ _____/ / /_  ____  / / /_
     / __  / _ \/ __ `/ __  / __ \/ __ \/ / __/
    / /_/ /  __/ /_/ / /_/ / /_/ / /_/ / / /_
    \__,_/\___/\__,_/\__,_/_.___/\____/_/\__/
```

## Description [![Build Status](https://secure.travis-ci.org/indutny/deadbolt.png)](http://travis-ci.org/indutny/deadbolt>)

Having locks in async world is not so straight-forward as it may look like.
Everything can work fine, but when exception will be thrown in your app - locks
may stay active until script's termination.

Here comes *deadbolt* to save all us:

```javascript
var deadbolt = require('deadbolt');

deadbolt.lock('some-action-id', function (err, lock) {

  if (err) console.error(err); // 'some-action-id' is already running somewhere

  doAsyncActionThatProbablyThrows(function () {
    lock.release(function (err) {
      // Released lock if err === null
    });
  });

}).autorelease(function (err) {

  console.error('Execution stopped somewhere inside lock');
  console.error('Released lock automatically');
  console.error('Reason: ' + err);

});
```

Or just wrap callbacks without setting lock:

```javascript
function asyncAction(callback) {
  callback = deadbolt.wrap(callback);
  doOtherAsyncActionThatMayForgotToCall(callback);
};
```

## How does it work?

It's using [v8](https://github.com/v8/v8)'s [MakeWeak](http://bespin.cz/~ondras/html/classv8_1_1Persistent.html#ab04609812113450bece2640ad0b27658)
black magic. When `lock` becomes weak (not referenced in your program) -
`autorelease` callback will be called.

Basically, if you forgot to call your `callback` - deadbolt will do it for you.

## API

Full documentation is available [here](http://indutny.github.com/deadbolt/).


### deadbolt.create

```javascript
deadbolt.create('storage-type', { /* storage options */ });
```

Creates `Deadbolt`'s instance, default storage type is `memory` (`redis` is 
available for multi-process locks).

Possible options for redis storage are:

```javascript
{
  "host": "localhost",
  "port": 6379,
  "password": "redis password, if you have any",

  "ttl": 300, // time-to-live for locks (see EXPIRE command for redis)
  "prefix": "deadbolt" // all used keys will be prefixed
}
```

### deadbolt.lock

```javascript
// for global instance with memory storage
deadbolt.lock('lock-id', /* optional */ 'info', callback);

// For some manually created instance
Deadbolt#lock(...);
```

Creates lock, `info` will be shown in error passed to `autorelease` callback.


### lock.release, lock.autorelease

```javascript
deadbolt.lock(..., function(err, lock) {
  // Release lock manually
  lock.release(function(err) {
  });
}).autorelease(function(err) {
  // Lock was released automatically
});
```

## Installation

If you're using npm:

```bash
npm install deadbolt
```

From source:

```bash
git clone git://github.com/indutny/deadbolt.git
cd deadbolt
./configure && make
```


#### LICENSE

(The MIT License)

Copyright (c) 2011 Fedor Indutny <fedor@indutny.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
