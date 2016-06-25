import Bluebird from 'bluebird';
import { assert, should, expect } from 'chai';

before(() => {
  global.assert = assert;
  global.should = should();
  global.expect = expect;

  if (typeof global.Promise === 'undefined') global.Promise = Bluebird;
});
