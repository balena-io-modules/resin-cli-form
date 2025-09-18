import Promise from 'bluebird';
import * as sinon from 'sinon';
import visuals from 'resin-cli-visuals';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chaiUse(chaiAsPromised);
var form = require('../build/form');
var utils = require('../build/utils');

describe('Form:', function () {
	describe('.run()', function () {
		describe('given a single text input form', function () {
			beforeEach(function () {
				this.form = [
					{
						message: 'Foo',
						name: 'foo',
						type: 'text',
					},
				];
			});
			describe('given the user sends an empty answer', function () {
				beforeEach(function () {
					this.utilsPromptStub = sinon.stub(utils, 'prompt');
					return this.utilsPromptStub.returns(
						Promise.resolve({
							foo: '',
						}),
					);
				});
				afterEach(function () {
					return this.utilsPromptStub.restore();
				});
				it('should discard the answer', async function () {
					const promise = form.run(this.form);
					await expect(promise).to.eventually.become({});
				});
			});
			describe('given the user sends a blank answer', function () {
				beforeEach(function () {
					this.utilsPromptStub = sinon.stub(utils, 'prompt');
					return this.utilsPromptStub.returns(
						Promise.resolve({
							foo: '   ',
						}),
					);
				});
				afterEach(function () {
					return this.utilsPromptStub.restore();
				});
				it('should discard the answer', async function () {
					const promise = form.run(this.form);
					await expect(promise).to.eventually.become({});
				});
			});
		});
		describe('given a simple form', function () {
			beforeEach(function () {
				this.utilsPromptStub = sinon.stub(utils, 'prompt');
				this.utilsPromptStub.onFirstCall().returns(
					Promise.resolve({
						processorType: 'Z7010',
					}),
				);
				return this.utilsPromptStub.onSecondCall().returns(
					Promise.resolve({
						coprocessorCore: '64',
					}),
				);
			});
			afterEach(function () {
				return this.utilsPromptStub.restore();
			});
			it('should eventually be the result', async function () {
				const promise = form.run([
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
					coprocessorCore: '64',
				});
			});
			describe('given an override option', function () {
				it('should override the selected question', async function () {
					const promise = form.run(
						[
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
						],
						{
							override: {
								coprocessorCore: '16',
							},
						},
					);
					await expect(promise).to.eventually.become({
						processorType: 'Z7010',
						coprocessorCore: '16',
					});
				});
				it('should be able to override all questions', async function () {
					const promise = form.run(
						[
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
						],
						{
							override: {
								processorType: 'Z7020',
								coprocessorCore: '16',
							},
						},
					);
					await expect(promise).to.eventually.become({
						processorType: 'Z7020',
						coprocessorCore: '16',
					});
				});
				it('should ignore invalid override options', async function () {
					const promise = form.run(
						[
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
						],
						{
							override: {
								foo: 'bar',
							},
						},
					);
					await expect(promise).to.eventually.become({
						processorType: 'Z7010',
						coprocessorCore: '64',
					});
				});
				it('should ignore undefined and null options', async function () {
					const promise = form.run(
						[
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
						],
						{
							override: {
								processorType: void 0,
								coprocessorCore: null,
							},
						},
					);
					await expect(promise).to.eventually.become({
						processorType: 'Z7010',
						coprocessorCore: '64',
					});
				});
				it('should reject with the passed error if validate function returns a string', async function () {
					const promise = form.run(
						[
							{
								message: 'username',
								name: 'username',
								type: 'input',
								validate: function (input) {
									if (input.length < 3) {
										return 'Username too short';
									}
									return true;
								},
							},
						],
						{
							override: {
								username: 'fb',
							},
						},
					);
					await expect(promise).to.be.rejectedWith('Username too short');
				});
				it('should reject with a default message if validate function returns false', async function () {
					const promise = form.run(
						[
							{
								message: 'username',
								name: 'username',
								type: 'input',
								validate: function () {
									return false;
								},
							},
						],
						{
							override: {
								username: 'fb',
							},
						},
					);
					await expect(promise).to.be.rejectedWith(
						'fb is not a valid username',
					);
				});
				it('should fulfil the answer if validate returns true', async function () {
					const promise = form.run(
						[
							{
								message: 'username',
								name: 'username',
								type: 'input',
								validate: function () {
									return true;
								},
							},
						],
						{
							override: {
								username: 'fb',
							},
						},
					);
					await expect(promise).to.eventually.deep.equal({
						username: 'fb',
					});
				});
			});
		});
		describe('given a form with a drive input', function () {
			beforeEach(function () {
				this.utilsPromptStub = sinon.stub(utils, 'prompt');
				this.utilsPromptStub.onFirstCall().returns(
					Promise.resolve({
						processorType: 'Z7010',
					}),
				);
				this.utilsPromptStub.onSecondCall().returns(
					Promise.resolve({
						coprocessorCore: '64',
					}),
				);
				this.visualsDriveStub = sinon.stub(visuals, 'drive');
				return this.visualsDriveStub.returns(Promise.resolve('/dev/disk2'));
			});
			afterEach(function () {
				this.utilsPromptStub.restore();
				return this.visualsDriveStub.restore();
			});
			it('should eventually be the result', async function () {
				const promise = form.run([
					{
						message: 'Processor',
						name: 'processorType',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					},
					{
						message: 'Select a drive',
						type: 'drive',
						name: 'device',
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
					device: '/dev/disk2',
					coprocessorCore: '64',
				});
			});
			it('should be able to override the drive', async function () {
				const promise = form.run(
					[
						{
							message: 'Processor',
							name: 'processorType',
							type: 'list',
							choices: ['Z7010', 'Z7020'],
						},
						{
							message: 'Select a drive',
							type: 'drive',
							name: 'device',
						},
						{
							message: 'Coprocessor cores',
							name: 'coprocessorCore',
							type: 'list',
							choices: ['16', '64'],
						},
					],
					{
						override: {
							device: '/dev/disk5',
						},
					},
				);
				await expect(promise).to.eventually.become({
					processorType: 'Z7010',
					device: '/dev/disk5',
					coprocessorCore: '64',
				});
			});
		});
		describe('given a form with `when` properties', function () {
			beforeEach(function () {
				return (this.form = [
					{
						message: 'Network Connection',
						name: 'network',
						type: 'list',
						choices: ['ethernet', 'wifi'],
					},
					{
						message: 'Wifi SSID',
						name: 'wifiSsid',
						type: 'text',
						when: {
							network: 'wifi',
						},
					},
					{
						message: 'Wifi Passphrase',
						name: 'wifiKey',
						type: 'password',
						when: {
							network: 'wifi',
						},
					},
				]);
			});
			describe('given network is ethernet', function () {
				beforeEach(function () {
					this.utilsPromptStub = sinon.stub(utils, 'prompt');
					this.utilsPromptStub.onFirstCall().returns(
						Promise.resolve({
							network: 'ethernet',
						}),
					);
					this.utilsPromptStub.onSecondCall().returns(
						Promise.resolve({
							wifiSsid: 'wifinetwork',
						}),
					);
					return this.utilsPromptStub.onThirdCall().returns(
						Promise.resolve({
							wifiKey: 'wifipassword',
						}),
					);
				});
				afterEach(function () {
					return this.utilsPromptStub.restore();
				});
				it('should not ask wifi questions', async function () {
					const promise = form.run([this.form]);
					await expect(promise).to.eventually.become({
						network: 'ethernet',
					});
				});
				it('should ignore wifi overrides', async function () {
					const promise = form.run([this.form], {
						override: {
							wifiSsid: 'foo',
							wifiKey: 'bar',
						},
					});
					await expect(promise).to.eventually.become({
						network: 'ethernet',
					});
				});
			});
			describe('given network is wifi', function () {
				beforeEach(function () {
					this.utilsPromptStub = sinon.stub(utils, 'prompt');
					this.utilsPromptStub.onFirstCall().returns(
						Promise.resolve({
							network: 'wifi',
						}),
					);
					this.utilsPromptStub.onSecondCall().returns(
						Promise.resolve({
							wifiSsid: 'wifinetwork',
						}),
					);
					return this.utilsPromptStub.onThirdCall().returns(
						Promise.resolve({
							wifiKey: 'wifipassword',
						}),
					);
				});
				afterEach(function () {
					return this.utilsPromptStub.restore();
				});
				it('should ask wifi questions', async function () {
					const promise = form.run([this.form]);
					await expect(promise).to.eventually.become({
						network: 'wifi',
						wifiSsid: 'wifinetwork',
						wifiKey: 'wifipassword',
					});
				});
			});
		});
	});
	describe('.ask()', function () {
		describe('given there is an error running the question', function () {
			beforeEach(function () {
				this.formRunStub = sinon.stub(form, 'run');
				return this.formRunStub.returns(
					Promise.reject(new Error('form error')),
				);
			});
			afterEach(function () {
				return this.formRunStub.restore();
			});
			it('should yield the error', async function () {
				const promise = form.ask({
					message: 'Processor',
					type: 'list',
					choices: ['Z7010', 'Z7020'],
				});
				await expect(promise).to.be.rejectedWith('form error');
			});
		});
		describe('given there is not an error running the question', function () {
			describe('given a question without a name property', function () {
				beforeEach(function () {
					this.formRunStub = sinon.stub(form, 'run');
					return this.formRunStub.returns(
						Promise.resolve({
							question: 'Z7010',
						}),
					);
				});
				afterEach(function () {
					return this.formRunStub.restore();
				});
				it('should give the answer back', async function () {
					const promise = form.ask({
						message: 'Processor',
						type: 'list',
						choices: ['Z7010', 'Z7020'],
					});
					await expect(promise).to.eventually.equal('Z7010');
				});
			});
			describe('given a question with a name property', function () {
				beforeEach(function () {
					this.formRunStub = sinon.stub(form, 'run');
					return this.formRunStub.returns(
						Promise.resolve({
							processorType: 'Z7010',
						}),
					);
				});
				afterEach(function () {
					return this.formRunStub.restore();
				});
				it('should give the answer back', async function () {
					const promise = form.ask({
						message: 'Processor',
						type: 'list',
						name: 'processorType',
						choices: ['Z7010', 'Z7020'],
					});
					await expect(promise).to.eventually.equal('Z7010');
				});
			});
		});
	});
});
