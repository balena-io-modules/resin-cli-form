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
