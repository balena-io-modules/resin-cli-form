import * as sinon from 'sinon';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chaiUse(chaiAsPromised);
import inquirer from 'inquirer';
import * as utils from '../build/utils';

describe('Utils:', function () {
	describe('.flatten()', function () {
		describe('given a form group', function () {
			beforeEach(function () {
				this.form = [
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
								choices: ['ethernet', 'wifi'],
							},
						],
					},
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				];
			});
			it('should ignore the grouping and include all the questions', function () {
				const questions = utils.flatten(this.form);
				expect(questions).to.deep.equal([
					{
						message: 'Network Connection',
						name: 'network',
						type: 'list',
						choices: ['ethernet', 'wifi'],
					},
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				]);
			});
		});
		describe('given a form group that contains a group', function () {
			beforeEach(function () {
				this.form = [
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
										choices: ['ethernet', 'wifi'],
									},
								],
							},
							{
								message: 'Wifi Passphrase',
								name: 'wifiKey',
								type: 'text',
							},
						],
					},
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				];
			});
			it('should deep flatten the group options', function () {
				const questions = utils.flatten(this.form);
				expect(questions).to.deep.equal([
					{
						message: 'Network Connection',
						name: 'network',
						type: 'list',
						choices: ['ethernet', 'wifi'],
					},
					{
						message: 'Wifi Passphrase',
						name: 'wifiKey',
						type: 'text',
					},
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				]);
			});
		});
	});
	describe('.parse()', function () {
		describe('given a simple question', function () {
			beforeEach(function () {
				this.form = [
					{
						message: 'Network type',
						name: 'network',
						type: 'input',
						default: 'wifi',
					},
				];
			});
			it('should parse the question correctly', function () {
				const questions = utils.parse(this.form);
				expect(questions).to.deep.equal([
					{
						message: 'Network type',
						name: 'network',
						type: 'input',
						default: 'wifi',
					},
				]);
			});
		});
		describe('given a question with an when property', function () {
			describe('given a single value when', function () {
				beforeEach(function () {
					this.form = [
						{
							message: 'Coprocessor cores',
							name: 'coprocessorCore',
							type: 'list',
							choices: ['16', '64'],
							when: {
								processorType: 'Z7010',
							},
						},
					];
				});
				it('should return a shouldPrompt function', function () {
					const questions = utils.parse(this.form);
					expect(questions[0].shouldPrompt).to.be.a('function');
				});
				it('should return true if the condition is met', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: 'Z7010',
						}),
					).to.be['true'];
				});
				it('should return false if the condition is not met', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: 'Z7020',
						}),
					).to.be['false'];
				});
				it('should return false if the property does not exist', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							foo: 'Z7020',
						}),
					).to.be['false'];
				});
				it('should return false if no answer', function () {
					const questions = utils.parse(this.form);
					expect(questions[0].shouldPrompt()).to.be['false'];
					expect(questions[0].shouldPrompt({})).to.be['false'];
				});
				it('should not have a when property', function () {
					const questions = utils.parse(this.form);
					expect(questions[0].when).to.not.exist;
				});
			});
			describe('given a multiple value when', function () {
				beforeEach(function () {
					this.form = [
						{
							message: 'Coprocessor cores',
							name: 'coprocessorCore',
							type: 'list',
							choices: ['16', '64'],
							when: {
								processorType: 'Z7010',
								hdmi: true,
							},
						},
					];
				});
				it('should return true if all the conditions are met', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: 'Z7010',
							hdmi: true,
						}),
					).to.be['true'];
				});
				it('should return false if any condition is not met', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: 'Z7020',
							hdmi: false,
						}),
					).to.be['false'];
				});
			});
			describe('given a truthy single value when', function () {
				beforeEach(function () {
					this.form = [
						{
							message: 'Coprocessor cores',
							name: 'coprocessorCore',
							type: 'list',
							choices: ['16', '64'],
							when: {
								processorType: true,
							},
						},
					];
				});
				it('should return true if the condition value exists', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: true,
						}),
					).to.be['true'];
					expect(
						questions[0].shouldPrompt({
							processorType: 'Z7010',
						}),
					).to.be['true'];
					expect(
						questions[0].shouldPrompt({
							processorType: 'Z7020',
						}),
					).to.be['true'];
				});
				it('should return false if the condition value does not exist', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							foo: 'bar',
						}),
					).to.be['false'];
					expect(
						questions[0].shouldPrompt({
							processorType: void 0,
						}),
					).to.be['false'];
					expect(
						questions[0].shouldPrompt({
							processorType: null,
						}),
					).to.be['false'];
				});
				it('should return false if the conditional value is false', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: false,
						}),
					).to.be['false'];
				});
				it('should return false if the conditional value is an empty string', function () {
					const questions = utils.parse(this.form);
					expect(
						questions[0].shouldPrompt({
							processorType: '',
						}),
					).to.be['false'];
				});
			});
		});
		describe('given a form group', function () {
			beforeEach(function () {
				this.form = [
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
								choices: ['ethernet', 'wifi'],
							},
						],
					},
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				];
			});
			it('should ignore the grouping and include all the questions', function () {
				const questions = utils.parse(this.form);
				expect(questions).to.deep.equal([
					{
						message: 'Network Connection',
						name: 'network',
						type: 'list',
						choices: ['ethernet', 'wifi'],
					},
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				]);
			});
		});
		describe('given a drive input', function () {
			beforeEach(function () {
				this.form = [
					{
						message: 'Select a drive',
						type: 'drive',
						name: 'drive',
					},
				];
			});
			it('should be parsed correctly', function () {
				const questions = utils.parse(this.form);
				expect(questions).to.deep.equal([
					{
						message: 'Select a drive',
						type: 'drive',
						name: 'drive',
					},
				]);
			});
		});
	});
	describe('.prompt()', function () {
		describe('given a single question form', function () {
			beforeEach(function () {
				this.inquirerPromptStub = sinon.stub(inquirer, 'prompt');
				return this.inquirerPromptStub.returns(
					Promise.resolve({
						processorType: 'bar',
					}),
				);
			});
			afterEach(function () {
				return this.inquirerPromptStub.restore();
			});
			it('should eventually be the result', async function () {
				const promise = utils.prompt([
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
				]);
				await expect(promise).to.eventually.become({
					processorType: 'bar',
				});
			});
		});
		describe('given a multiple question form', function () {
			beforeEach(function () {
				this.inquirerPromptStub = sinon.stub(inquirer, 'prompt');
				return this.inquirerPromptStub.returns(
					Promise.resolve({
						processorType: 'Z7010',
						coprocessorCore: '16',
					}),
				);
			});
			afterEach(function () {
				return this.inquirerPromptStub.restore();
			});
			it('should eventually become the answers', async function () {
				const promise = utils.prompt([
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
					{
						message: 'Coprocessor cores',
						name: 'coprocessorCore',
						type: 'list',
						choices: ['16', '64'],
					},
				]);
				await expect(promise).to.eventually.become({
					processorType: 'Z7010',
					coprocessorCore: '16',
				});
			});
		});
	});
});
