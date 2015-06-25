m = require('mochainon')
Promise = require('bluebird')
inquirer = require('inquirer')
form = require('../lib/form')

describe 'Form:', ->

	describe '.run()', ->

		beforeEach ->
			@inquirerPromptStub = m.sinon.stub(inquirer, 'prompt')
			@inquirerPromptStub.yields({ foo: 'bar' })

		afterEach ->
			@inquirerPromptStub.restore()

		it 'should eventually be the result', ->
			promise = form.run [
				message: 'Processor'
				name: 'processorType'
				type: 'list'
				choices: [ 'Z7010', 'Z7020' ]
			]

			m.chai.expect(promise).to.eventually.become(foo: 'bar')

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
