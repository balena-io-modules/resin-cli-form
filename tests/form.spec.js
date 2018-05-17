var Promise = require('bluebird');
var inquirer = require('inquirer');
var visuals = require('resin-cli-visuals');
var m = require('mochainon');
var form = require('../build/form');
var utils = require('../build/utils');

describe('Form:', function() {
  describe('.run()', function() {
    describe('given a single text input form', function() {
      beforeEach(function() {
        return this.form = [
          {
            message: 'Foo',
            name: 'foo',
            type: 'text'
          }
        ];
      });
      describe('given the user sends an empty answer', function() {
        beforeEach(function() {
          this.utilsPromptStub = m.sinon.stub(utils, 'prompt');
          return this.utilsPromptStub.returns(Promise.resolve({
            foo: ''
          }));
        });
        afterEach(function() {
          return this.utilsPromptStub.restore();
        });
        return it('should discard the answer', function() {
          var promise;
          promise = form.run(this.form);
          return m.chai.expect(promise).to.eventually.become({});
        });
      });
      return describe('given the user sends a blank answer', function() {
        beforeEach(function() {
          this.utilsPromptStub = m.sinon.stub(utils, 'prompt');
          return this.utilsPromptStub.returns(Promise.resolve({
            foo: '   '
          }));
        });
        afterEach(function() {
          return this.utilsPromptStub.restore();
        });
        return it('should discard the answer', function() {
          var promise;
          promise = form.run(this.form);
          return m.chai.expect(promise).to.eventually.become({});
        });
      });
    });
    describe('given a simple form', function() {
      beforeEach(function() {
        this.utilsPromptStub = m.sinon.stub(utils, 'prompt');
        this.utilsPromptStub.onFirstCall().returns(Promise.resolve({
          processorType: 'Z7010'
        }));
        return this.utilsPromptStub.onSecondCall().returns(Promise.resolve({
          coprocessorCore: '64'
        }));
      });
      afterEach(function() {
        return this.utilsPromptStub.restore();
      });
      it('should eventually be the result', function() {
        var promise;
        promise = form.run([
          {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }, {
            message: 'Coprocessor cores',
            name: 'coprocessorCore',
            type: 'list',
            choices: ['16', '64']
          }
        ]);
        return m.chai.expect(promise).to.eventually.become({
          processorType: 'Z7010',
          coprocessorCore: '64'
        });
      });
      return describe('given an override option', function() {
        it('should override the selected question', function() {
          var promise;
          promise = form.run([
            {
              message: 'Processor',
              name: 'processorType',
              type: 'list',
              choices: ['Z7010', 'Z7020']
            }, {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64']
            }
          ], {
            override: {
              coprocessorCore: '16'
            }
          });
          return m.chai.expect(promise).to.eventually.become({
            processorType: 'Z7010',
            coprocessorCore: '16'
          });
        });
        it('should be able to override all questions', function() {
          var promise;
          promise = form.run([
            {
              message: 'Processor',
              name: 'processorType',
              type: 'list',
              choices: ['Z7010', 'Z7020']
            }, {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64']
            }
          ], {
            override: {
              processorType: 'Z7020',
              coprocessorCore: '16'
            }
          });
          return m.chai.expect(promise).to.eventually.become({
            processorType: 'Z7020',
            coprocessorCore: '16'
          });
        });
        it('should ignore invalid override options', function() {
          var promise;
          promise = form.run([
            {
              message: 'Processor',
              name: 'processorType',
              type: 'list',
              choices: ['Z7010', 'Z7020']
            }, {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64']
            }
          ], {
            override: {
              foo: 'bar'
            }
          });
          return m.chai.expect(promise).to.eventually.become({
            processorType: 'Z7010',
            coprocessorCore: '64'
          });
        });
        it('should ignore undefined and null options', function() {
          var promise;
          promise = form.run([
            {
              message: 'Processor',
              name: 'processorType',
              type: 'list',
              choices: ['Z7010', 'Z7020']
            }, {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64']
            }
          ], {
            override: {
              processorType: void 0,
              coprocessorCore: null
            }
          });
          return m.chai.expect(promise).to.eventually.become({
            processorType: 'Z7010',
            coprocessorCore: '64'
          });
        });
        it('should reject with the passed error if validate function returns a string', function() {
          var promise;
          promise = form.run([
            {
              message: 'username',
              name: 'username',
              type: 'input',
              validate: function(input) {
                if (input.length < 3) {
                  return 'Username too short';
                }
                return true;
              }
            }
          ], {
            override: {
              username: 'fb'
            }
          });
          return m.chai.expect(promise).to.be.rejectedWith('Username too short');
        });
        it('should reject with a default message if validate function returns false', function() {
          var promise;
          promise = form.run([
            {
              message: 'username',
              name: 'username',
              type: 'input',
              validate: function() {
                return false;
              }
            }
          ], {
            override: {
              username: 'fb'
            }
          });
          return m.chai.expect(promise).to.be.rejectedWith('fb is not a valid username');
        });
        return it('should fulfil the answer if validate returns true', function() {
          var promise;
          promise = form.run([
            {
              message: 'username',
              name: 'username',
              type: 'input',
              validate: function() {
                return true;
              }
            }
          ], {
            override: {
              username: 'fb'
            }
          });
          return m.chai.expect(promise).to.eventually.deep.equal({
            username: 'fb'
          });
        });
      });
    });
    describe('given a form with a drive input', function() {
      beforeEach(function() {
        this.utilsPromptStub = m.sinon.stub(utils, 'prompt');
        this.utilsPromptStub.onFirstCall().returns(Promise.resolve({
          processorType: 'Z7010'
        }));
        this.utilsPromptStub.onSecondCall().returns(Promise.resolve({
          coprocessorCore: '64'
        }));
        this.visualsDriveStub = m.sinon.stub(visuals, 'drive');
        return this.visualsDriveStub.returns(Promise.resolve('/dev/disk2'));
      });
      afterEach(function() {
        this.utilsPromptStub.restore();
        return this.visualsDriveStub.restore();
      });
      it('should eventually be the result', function() {
        var promise;
        promise = form.run([
          {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }, {
            message: 'Select a drive',
            type: 'drive',
            name: 'device'
          }, {
            message: 'Coprocessor cores',
            name: 'coprocessorCore',
            type: 'list',
            choices: ['16', '64']
          }
        ]);
        return m.chai.expect(promise).to.eventually.become({
          processorType: 'Z7010',
          device: '/dev/disk2',
          coprocessorCore: '64'
        });
      });
      return it('should be able to override the drive', function() {
        var promise;
        promise = form.run([
          {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }, {
            message: 'Select a drive',
            type: 'drive',
            name: 'device'
          }, {
            message: 'Coprocessor cores',
            name: 'coprocessorCore',
            type: 'list',
            choices: ['16', '64']
          }
        ], {
          override: {
            device: '/dev/disk5'
          }
        });
        return m.chai.expect(promise).to.eventually.become({
          processorType: 'Z7010',
          device: '/dev/disk5',
          coprocessorCore: '64'
        });
      });
    });
    return describe('given a form with `when` properties', function() {
      beforeEach(function() {
        return this.form = [
          {
            message: 'Network Connection',
            name: 'network',
            type: 'list',
            choices: ['ethernet', 'wifi']
          }, {
            message: 'Wifi SSID',
            name: 'wifiSsid',
            type: 'text',
            when: {
              network: 'wifi'
            }
          }, {
            message: 'Wifi Passphrase',
            name: 'wifiKey',
            type: 'password',
            when: {
              network: 'wifi'
            }
          }
        ];
      });
      describe('given network is ethernet', function() {
        beforeEach(function() {
          this.utilsPromptStub = m.sinon.stub(utils, 'prompt');
          this.utilsPromptStub.onFirstCall().returns(Promise.resolve({
            network: 'ethernet'
          }));
          this.utilsPromptStub.onSecondCall().returns(Promise.resolve({
            wifiSsid: 'wifinetwork'
          }));
          return this.utilsPromptStub.onThirdCall().returns(Promise.resolve({
            wifiKey: 'wifipassword'
          }));
        });
        afterEach(function() {
          return this.utilsPromptStub.restore();
        });
        it('should not ask wifi questions', function() {
          var promise;
          promise = form.run([this.form]);
          return m.chai.expect(promise).to.eventually.become({
            network: 'ethernet'
          });
        });
        return it('should ignore wifi overrides', function() {
          var promise;
          promise = form.run([this.form], {
            override: {
              wifiSsid: 'foo',
              wifiKey: 'bar'
            }
          });
          return m.chai.expect(promise).to.eventually.become({
            network: 'ethernet'
          });
        });
      });
      return describe('given network is wifi', function() {
        beforeEach(function() {
          this.utilsPromptStub = m.sinon.stub(utils, 'prompt');
          this.utilsPromptStub.onFirstCall().returns(Promise.resolve({
            network: 'wifi'
          }));
          this.utilsPromptStub.onSecondCall().returns(Promise.resolve({
            wifiSsid: 'wifinetwork'
          }));
          return this.utilsPromptStub.onThirdCall().returns(Promise.resolve({
            wifiKey: 'wifipassword'
          }));
        });
        afterEach(function() {
          return this.utilsPromptStub.restore();
        });
        return it('should ask wifi questions', function() {
          var promise;
          promise = form.run([this.form]);
          return m.chai.expect(promise).to.eventually.become({
            network: 'wifi',
            wifiSsid: 'wifinetwork',
            wifiKey: 'wifipassword'
          });
        });
      });
    });
  });
  return describe('.ask()', function() {
    describe('given there is an error running the question', function() {
      beforeEach(function() {
        this.formRunStub = m.sinon.stub(form, 'run');
        return this.formRunStub.returns(Promise.reject(new Error('form error')));
      });
      afterEach(function() {
        return this.formRunStub.restore();
      });
      return it('should yield the error', function() {
        var promise;
        promise = form.ask({
          message: 'Processor',
          type: 'list',
          choices: ['Z7010', 'Z7020']
        });
        return m.chai.expect(promise).to.be.rejectedWith('form error');
      });
    });
    return describe('given there is not an error running the question', function() {
      describe('given a question without a name property', function() {
        beforeEach(function() {
          this.formRunStub = m.sinon.stub(form, 'run');
          return this.formRunStub.returns(Promise.resolve({
            question: 'Z7010'
          }));
        });
        afterEach(function() {
          return this.formRunStub.restore();
        });
        return it('should give the answer back', function() {
          var promise;
          promise = form.ask({
            message: 'Processor',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          });
          return m.chai.expect(promise).to.eventually.equal('Z7010');
        });
      });
      return describe('given a question with a name property', function() {
        beforeEach(function() {
          this.formRunStub = m.sinon.stub(form, 'run');
          return this.formRunStub.returns(Promise.resolve({
            processorType: 'Z7010'
          }));
        });
        afterEach(function() {
          return this.formRunStub.restore();
        });
        return it('should give the answer back', function() {
          var promise;
          promise = form.ask({
            message: 'Processor',
            type: 'list',
            name: 'processorType',
            choices: ['Z7010', 'Z7020']
          });
          return m.chai.expect(promise).to.eventually.equal('Z7010');
        });
      });
    });
  });
});
