import Bluebird from 'bluebird';

before(function () {

  global.assert = require('chai').assert;
  global.should = require('chai').should();
  global.expect = require('chai').expect;

  if (typeof global.Promise === 'undefined') global.Promise = Bluebird;

});
