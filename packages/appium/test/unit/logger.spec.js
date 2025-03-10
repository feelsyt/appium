import {init as logsinkInit, clear as logsinkClear} from '../../lib/logsink';
// eslint-disable-next-line import/named
import {createSandbox} from 'sinon';
import {logger} from '@appium/support';

// temporarily turn on logging to stdio, so we can catch and query
const forceLogs = process.env._FORCE_LOGS;
process.env._FORCE_LOGS = 1;
const log = logger.getLogger('Appium');

describe('logging', function () {
  let sandbox;
  let stderrSpy;
  let stdoutSpy;
  beforeEach(async function () {
    const chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
    chai.should();

    sandbox = createSandbox();
    stderrSpy = sandbox.spy(process.stderr, 'write');
    stdoutSpy = sandbox.spy(process.stdout, 'write');
    logsinkClear();
  });
  afterEach(function () {
    sandbox.restore();
  });
  after(function () {
    process.env._FORCE_LOGS = forceLogs;
  });

  const errorMsg = 'some error';
  const warnMsg = 'some warning';
  const debugMsg = 'some debug';

  function doLogging() {
    log.error(errorMsg);
    log.warn(warnMsg);
    log.debug(debugMsg);
  }

  it('should send error, info and debug when loglevel is debug', async function () {
    await logsinkInit({loglevel: 'debug'});

    doLogging();

    stderrSpy.callCount.should.equal(1);
    stderrSpy.args[0][0].should.include(errorMsg);

    stdoutSpy.callCount.should.equal(2);
    stdoutSpy.args[0][0].should.include(warnMsg);
    stdoutSpy.args[1][0].should.include(debugMsg);
  });
  it('should send error and info when loglevel is info', async function () {
    await logsinkInit({loglevel: 'info'});

    doLogging();

    stderrSpy.callCount.should.equal(1);
    stderrSpy.args[0][0].should.include(errorMsg);

    stdoutSpy.callCount.should.equal(1);
    stdoutSpy.args[0][0].should.include(warnMsg);
  });
  it('should send error when loglevel is error', async function () {
    await logsinkInit({loglevel: 'error'});

    doLogging();

    stderrSpy.callCount.should.equal(1);
    stderrSpy.args[0][0].should.include(errorMsg);

    stdoutSpy.callCount.should.equal(0);
  });
});
