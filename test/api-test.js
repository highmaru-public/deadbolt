var vows = require('vows'),
    assert = require('assert');

var deadbolt = require('../lib/deadbolt');

var d, shared = {};

function doGc() {
  return setInterval(function () { gc(); }, 200);
};

vows.describe('deadbolt/api').addBatch({
  'Calling deadbolt.create()': {
    topic: function () {
      d = deadbolt.create();
      return null;
    },
    'should create deadbolt instance with memory storage': function () {}
  }
}).addBatch({
  'Calling d.lock(id, callback)': {
    topic: function () {
      d.lock('a', this.callback);
    },
    'should return object': {
      'with .release method': function (err, o) {
        assert.isNull(err);
        assert.include(o, 'release');
      },
      'and if calling it\'s .release(callback) method': {
        topic: function (o) {
          o.release(this.callback);
        },
        'should call callback': function (err, data) {
          assert.isNull(err);
        },
        'and finally calling d.lock again': {
          topic: function () {
            d.lock('a', this.callback);
          },
          'should be successful': function (err, data) {
            assert.isNull(err);
          }
        }
      }
    }
  }
}).addBatch({
  'Calling d.lock(id, callback)': {
    topic: function () {
      d.lock('b', this.callback);
    },
    'should return object': {
      'with .release method': function (err, o) {
        assert.isNull(err);
        assert.include(o, 'release');
      },
      'and calling d.lock(id, callback) twice': {
        topic: function () {
          d.lock('b', this.callback);
        },
        'should return error': function (err, data) {
          assert.ok(err);
        }
      }
    }
  }
}).addBatch({
  'Calling d.lock(id, nop).autorelease(callback)': {
    topic: function () {
      var callback = this.callback;
      d.lock('c', function () {}).autorelease(function (err) {
        callback(null, err);
      });
      this.int = doGc();
    },
    'should call autorelease callback with error': function (err) {
      clearInterval(this.int);
      assert.ok(err);
    },
    'and creating same lock again': {
      topic: function () {
        d.lock('c', this.callback);
      },
      'should be without errors': function () {
      }
    }
  }
}).addBatch({
  'Calling d.lock(id, nop).autorelease(callback)': {
    topic: function () {
      var callback = this.callback,
          autorelease = null;

      d.lock('d', function (err, ref) {
        if (err) return callback(null, err);

        setTimeout(function () {
          ref.release(function () {
            callback(null, autorelease);
          });
        }, 1000);

      }).autorelease(function (err) {
        autorelease = err;
      });

      this.int = doGc();
    },
    'should call autorelease callback with error': function (err) {
      clearInterval(this.int);
      assert.isNull(err);
    },
    'and creating same lock again': {
      topic: function () {
        d.lock('d', this.callback);
      },
      'should be without errors': function () {
      }
    }
  }
}).addBatch({
  'Calling d.lock(nop).autorelease(callback)': {
    topic: function () {
      var callback = this.callback;
      d.lock(function () {}).autorelease(function (err) {
        callback(null, err);
      });
      this.int = doGc();
    },
    'should call autorelease callback with error': function (err) {
      clearInterval(this.int);
      assert.ok(err);
    }
  }
}).addBatch({
  'Calling d.lock(nop).autorelease(callback)': {
    topic: function () {
      var callback = this.callback,
          autorelease = null;

      d.lock(function (err, ref) {
        if (err) return callback(null, err);

        setTimeout(function () {
          ref.release(function () {
            callback(null, autorelease);
          });
        }, 1000);

      }).autorelease(function (err) {
        autorelease = err;
      });

      this.int = doGc();
    },
    'should call autorelease callback with error': function (err) {
      clearInterval(this.int);
      assert.isNull(err);
    }
  }
}).addBatch({
  'Calling deadbolt.lock()': {
    topic: function () {
      shared.lock = deadbolt.lock();
      return null;
    },
    'should return object': {
      'with .autorelease() method': function (lock) {
        assert.include(shared.lock, 'autorelease');
      },
      'with .release() method': function (lock) {
        assert.include(shared.lock, 'release');
      },
      'and when calling .autorelease(callback) on it': {
        topic: function (lock) {
          shared.lock.autorelease(this.callback);
          delete shared.lock;
          this.int = doGc();
        },
        'should call autorelease callback': function (err, data) {
          clearInterval(this.int);
          assert.ok(err);
        }
      }
    }
  }
}).export(module);
