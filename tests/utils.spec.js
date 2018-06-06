var m = require('mochainon');
var inquirer = require('inquirer');
var utils = require('../build/utils');

describe('Utils:', function() {
  describe('.flatten()', function() {
    describe('given a form group', function() {
      beforeEach(function() {
        return this.form = [
          {
            isGroup: true,
            name: 'network',
            message: 'Network',
            isCollapsible: true,
            collapsed: false,
            options: [
              {
                message: 'Network Connection',
                name: 'network',
                type: 'list',
                choices: ['ethernet', 'wifi']
              }
            ]
          }, {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ];
      });
      return it('should ignore the grouping and include all the questions', function() {
        var questions;
        questions = utils.flatten(this.form);
        return m.chai.expect(questions).to.deep.equal([
          {
            message: 'Network Connection',
            name: 'network',
            type: 'list',
            choices: ['ethernet', 'wifi']
          }, {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ]);
      });
    });
    return describe('given a form group that contains a group', function() {
      beforeEach(function() {
        return this.form = [
          {
            isGroup: true,
            name: 'network',
            message: 'Network',
            isCollapsible: true,
            collapsed: false,
            options: [
              {
                isGroup: true,
                name: 'network',
                message: 'Network',
                isCollapsible: true,
                collapsed: false,
                options: [
                  {
                    message: 'Network Connection',
                    name: 'network',
                    type: 'list',
                    choices: ['ethernet', 'wifi']
                  }
                ]
              }, {
                message: 'Wifi Passphrase',
                name: 'wifiKey',
                type: 'text'
              }
            ]
          }, {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ];
      });
      return it('should deep flatten the group options', function() {
        var questions;
        questions = utils.flatten(this.form);
        return m.chai.expect(questions).to.deep.equal([
          {
            message: 'Network Connection',
            name: 'network',
            type: 'list',
            choices: ['ethernet', 'wifi']
          }, {
            message: 'Wifi Passphrase',
            name: 'wifiKey',
            type: 'text'
          }, {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ]);
      });
    });
  });
  describe('.parse()', function() {
    describe('given a simple question', function() {
      beforeEach(function() {
        return this.form = [
          {
            message: 'Network type',
            name: 'network',
            type: 'input',
            "default": 'wifi'
          }
        ];
      });
      return it('should parse the question correctly', function() {
        var questions;
        questions = utils.parse(this.form);
        return m.chai.expect(questions).to.deep.equal([
          {
            message: 'Network type',
            name: 'network',
            type: 'input',
            "default": 'wifi'
          }
        ]);
      });
    });
    describe('given a question with an when property', function() {
      describe('given a single value when', function() {
        beforeEach(function() {
          return this.form = [
            {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64'],
              when: {
                processorType: 'Z7010'
              }
            }
          ];
        });
        it('should return a shouldPrompt function', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt).to.be.a('function');
        });
        it('should return true if the condition is met', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: 'Z7010'
          })).to.be["true"];
        });
        it('should return false if the condition is not met', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: 'Z7020'
          })).to.be["false"];
        });
        it('should return false if the property does not exist', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            foo: 'Z7020'
          })).to.be["false"];
        });
        it('should return false if no answer', function() {
          var questions;
          questions = utils.parse(this.form);
          m.chai.expect(questions[0].shouldPrompt()).to.be["false"];
          return m.chai.expect(questions[0].shouldPrompt({})).to.be["false"];
        });
        return it('should not have a when property', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].when).to.not.exist;
        });
      });
      describe('given a multiple value when', function() {
        beforeEach(function() {
          return this.form = [
            {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64'],
              when: {
                processorType: 'Z7010',
                hdmi: true
              }
            }
          ];
        });
        it('should return true if all the conditions are met', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: 'Z7010',
            hdmi: true
          })).to.be["true"];
        });
        return it('should return false if any condition is not met', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: 'Z7020',
            hdmi: false
          })).to.be["false"];
        });
      });
      return describe('given a truthy single value when', function() {
        beforeEach(function() {
          return this.form = [
            {
              message: 'Coprocessor cores',
              name: 'coprocessorCore',
              type: 'list',
              choices: ['16', '64'],
              when: {
                processorType: true
              }
            }
          ];
        });
        it('should return true if the condition value exists', function() {
          var questions;
          questions = utils.parse(this.form);
          m.chai.expect(questions[0].shouldPrompt({
            processorType: true
          })).to.be["true"];
          m.chai.expect(questions[0].shouldPrompt({
            processorType: 'Z7010'
          })).to.be["true"];
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: 'Z7020'
          })).to.be["true"];
        });
        it('should return false if the condition value does not exist', function() {
          var questions;
          questions = utils.parse(this.form);
          m.chai.expect(questions[0].shouldPrompt({
            foo: 'bar'
          })).to.be["false"];
          m.chai.expect(questions[0].shouldPrompt({
            processorType: void 0
          })).to.be["false"];
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: null
          })).to.be["false"];
        });
        it('should return false if the conditional value is false', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: false
          })).to.be["false"];
        });
        return it('should return false if the conditional value is an empty string', function() {
          var questions;
          questions = utils.parse(this.form);
          return m.chai.expect(questions[0].shouldPrompt({
            processorType: ''
          })).to.be["false"];
        });
      });
    });
    describe('given a form group', function() {
      beforeEach(function() {
        return this.form = [
          {
            isGroup: true,
            name: 'network',
            message: 'Network',
            isCollapsible: true,
            collapsed: false,
            options: [
              {
                message: 'Network Connection',
                name: 'network',
                type: 'list',
                choices: ['ethernet', 'wifi']
              }
            ]
          }, {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ];
      });
      return it('should ignore the grouping and include all the questions', function() {
        var questions;
        questions = utils.parse(this.form);
        return m.chai.expect(questions).to.deep.equal([
          {
            message: 'Network Connection',
            name: 'network',
            type: 'list',
            choices: ['ethernet', 'wifi']
          }, {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ]);
      });
    });
    return describe('given a drive input', function() {
      beforeEach(function() {
        return this.form = [
          {
            message: 'Select a drive',
            type: 'drive',
            name: 'drive'
          }
        ];
      });
      return it('should be parsed correctly', function() {
        var questions;
        questions = utils.parse(this.form);
        return m.chai.expect(questions).to.deep.equal([
          {
            message: 'Select a drive',
            type: 'drive',
            name: 'drive'
          }
        ]);
      });
    });
  });
  return describe('.prompt()', function() {
    describe('given a single question form', function() {
      beforeEach(function() {
        this.inquirerPromptStub = m.sinon.stub(inquirer, 'prompt');
        return this.inquirerPromptStub.resolves({
          processorType: 'bar'
        });
      });
      afterEach(function() {
        return this.inquirerPromptStub.restore();
      });
      return it('should eventually be the result', function() {
        var promise;
        promise = utils.prompt([
          {
            message: 'Processor',
            name: 'processorType',
            type: 'list',
            choices: ['Z7010', 'Z7020']
          }
        ]);
        return m.chai.expect(promise).to.eventually.become({
          processorType: 'bar'
        });
      });
    });
    return describe('given a multiple question form', function() {
      beforeEach(function() {
        this.inquirerPromptStub = m.sinon.stub(inquirer, 'prompt');
        return this.inquirerPromptStub.resolves({
          processorType: 'Z7010',
          coprocessorCore: '16'
        });
      });
      afterEach(function() {
        return this.inquirerPromptStub.restore();
      });
      return it('should eventually become the answers', function() {
        var promise;
        promise = utils.prompt([
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
          coprocessorCore: '16'
        });
      });
    });
  });
});
