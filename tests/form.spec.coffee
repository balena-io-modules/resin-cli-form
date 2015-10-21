m = require('mochainon')
Promise = require('bluebird')
inquirer = require('inquirer')
visuals = require('resin-cli-visuals')
utils = require('../lib/utils')
form = require('../lib/form')

describe 'Form:', ->

	describe '.run()', ->

		describe 'given a simple form', ->

			beforeEach ->
				@utilsPromptStub = m.sinon.stub(utils, 'prompt')
				@utilsPromptStub.onFirstCall().returns(Promise.resolve(processorType: 'Z7010'))
				@utilsPromptStub.onSecondCall().returns(Promise.resolve(coprocessorCore: '64'))

			afterEach ->
				@utilsPromptStub.restore()

			it 'should eventually be the result', ->
				promise = form.run [
						message: 'Processor'
						name: 'processorType'
						type: 'list'
						choices: [ 'Z7010', 'Z7020' ]
					,
						message: 'Coprocessor cores'
						name: 'coprocessorCore'
						type: 'list'
						choices: [ '16', '64' ]
				]

				m.chai.expect(promise).to.eventually.become
					processorType: 'Z7010'
					coprocessorCore: '64'

			describe 'given an override option', ->

				it 'should override the selected question', ->
					promise = form.run [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
					],
						override:
							coprocessorCore: '16'

					m.chai.expect(promise).to.eventually.become
						processorType: 'Z7010'
						coprocessorCore: '16'

				it 'should be able to override all questions', ->
					promise = form.run [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
					],
						override:
							processorType: 'Z7020'
							coprocessorCore: '16'

					m.chai.expect(promise).to.eventually.become
						processorType: 'Z7020'
						coprocessorCore: '16'

				it 'should ignore invalid override options', ->
					promise = form.run [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
					],
						override:
							foo: 'bar'

					m.chai.expect(promise).to.eventually.become
						processorType: 'Z7010'
						coprocessorCore: '64'

				it 'should ignore undefined and null options', ->
					promise = form.run [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
					],
						override:
							processorType: undefined
							coprocessorCore: null

					m.chai.expect(promise).to.eventually.become
						processorType: 'Z7010'
						coprocessorCore: '64'

				it 'should reject with the passed error if validate function returns a string', ->
					promise = form.run [
						message: 'username'
						name: 'username'
						type: 'input'
						validate: (input) ->
							if input.length < 3
								return 'Username too short'
							return true
					],
						override:
							username: 'fb'

					m.chai.expect(promise).to.be.rejectedWith('Username too short')

				it 'should reject with a default message if validate function returns false', ->
					promise = form.run [
						message: 'username'
						name: 'username'
						type: 'input'
						validate: ->
							return false
					],
						override:
							username: 'fb'

					m.chai.expect(promise).to.be.rejectedWith('fb is not a valid username')

				it 'should fulfil the answer if validate returns true', ->
					promise = form.run [
						message: 'username'
						name: 'username'
						type: 'input'
						validate: ->
							return true
					],
						override:
							username: 'fb'

					m.chai.expect(promise).to.eventually.deep.equal(username: 'fb')

		describe 'given a form with a drive input', ->

			beforeEach ->
				@utilsPromptStub = m.sinon.stub(utils, 'prompt')
				@utilsPromptStub.onFirstCall().returns(Promise.resolve(processorType: 'Z7010'))
				@utilsPromptStub.onSecondCall().returns(Promise.resolve(coprocessorCore: '64'))

				@visualsDriveStub = m.sinon.stub(visuals, 'drive')
				@visualsDriveStub.returns(Promise.resolve('/dev/disk2'))

			afterEach ->
				@utilsPromptStub.restore()
				@visualsDriveStub.restore()

			it 'should eventually be the result', ->
				promise = form.run [
						message: 'Processor'
						name: 'processorType'
						type: 'list'
						choices: [ 'Z7010', 'Z7020' ]
					,
						message: 'Select a drive'
						type: 'drive'
						name: 'device'
					,
						message: 'Coprocessor cores'
						name: 'coprocessorCore'
						type: 'list'
						choices: [ '16', '64' ]
				]

				m.chai.expect(promise).to.eventually.become
					processorType: 'Z7010'
					device: '/dev/disk2'
					coprocessorCore: '64'

			it 'should be able to override the drive', ->
				promise = form.run [
						message: 'Processor'
						name: 'processorType'
						type: 'list'
						choices: [ 'Z7010', 'Z7020' ]
					,
						message: 'Select a drive'
						type: 'drive'
						name: 'device'
					,
						message: 'Coprocessor cores'
						name: 'coprocessorCore'
						type: 'list'
						choices: [ '16', '64' ]
				],
					override:
						device: '/dev/disk5'

				m.chai.expect(promise).to.eventually.become
					processorType: 'Z7010'
					device: '/dev/disk5'
					coprocessorCore: '64'

		describe 'given a form with `when` properties', ->

			beforeEach ->
				@form = [
						message: 'Network Connection'
						name: 'network'
						type: 'list'
						choices: [ 'ethernet', 'wifi' ]
					,
						message: 'Wifi SSID'
						name: 'wifiSsid'
						type: 'text'
						when:
							network: 'wifi'
					,
						message: 'Wifi Passphrase'
						name: 'wifiKey'
						type: 'password'
						when:
							network: 'wifi'
				]

			describe 'given network is ethernet', ->

				beforeEach ->
					@utilsPromptStub = m.sinon.stub(utils, 'prompt')
					@utilsPromptStub.onFirstCall().returns(Promise.resolve(network: 'ethernet'))
					@utilsPromptStub.onSecondCall().returns(Promise.resolve(wifiSsid: 'wifinetwork'))
					@utilsPromptStub.onThirdCall().returns(Promise.resolve(wifiKey: 'wifipassword'))

				afterEach ->
					@utilsPromptStub.restore()

				it 'should not ask wifi questions', ->
					promise = form.run([ @form ])
					m.chai.expect(promise).to.eventually.become
						network: 'ethernet'

				it 'should ignore wifi overrides', ->
					promise = form.run [ @form ],
						override:
							wifiSsid: 'foo'
							wifiKey: 'bar'

					m.chai.expect(promise).to.eventually.become
						network: 'ethernet'

			describe 'given network is wifi', ->

				beforeEach ->
					@utilsPromptStub = m.sinon.stub(utils, 'prompt')
					@utilsPromptStub.onFirstCall().returns(Promise.resolve(network: 'wifi'))
					@utilsPromptStub.onSecondCall().returns(Promise.resolve(wifiSsid: 'wifinetwork'))
					@utilsPromptStub.onThirdCall().returns(Promise.resolve(wifiKey: 'wifipassword'))

				afterEach ->
					@utilsPromptStub.restore()

				it 'should ask wifi questions', ->
					promise = form.run([ @form ])
					m.chai.expect(promise).to.eventually.become
						network: 'wifi'
						wifiSsid: 'wifinetwork'
						wifiKey: 'wifipassword'

	describe '.ask()', ->

		describe 'given there is an error running the question', ->

			beforeEach ->
				@formRunStub = m.sinon.stub(form, 'run')
				@formRunStub.returns(Promise.reject(new Error('form error')))

			afterEach ->
				@formRunStub.restore()

			it 'should yield the error', ->
				promise = form.ask
					message: 'Processor'
					type: 'list'
					choices: [ 'Z7010', 'Z7020' ]

				m.chai.expect(promise).to.be.rejectedWith('form error')

		describe 'given there is not an error running the question', ->

			describe 'given a question without a name property', ->

				beforeEach ->
					@formRunStub = m.sinon.stub(form, 'run')
					@formRunStub.returns(Promise.resolve(question: 'Z7010'))

				afterEach ->
					@formRunStub.restore()

				it 'should give the answer back', ->
					promise = form.ask
						message: 'Processor'
						type: 'list'
						choices: [ 'Z7010', 'Z7020' ]

					m.chai.expect(promise).to.eventually.equal('Z7010')

			describe 'given a question with a name property', ->

				beforeEach ->
					@formRunStub = m.sinon.stub(form, 'run')
					@formRunStub.returns(Promise.resolve(processorType: 'Z7010'))

				afterEach ->
					@formRunStub.restore()

				it 'should give the answer back', ->
					promise = form.ask
						message: 'Processor'
						type: 'list'
						name: 'processorType'
						choices: [ 'Z7010', 'Z7020' ]

					m.chai.expect(promise).to.eventually.equal('Z7010')
