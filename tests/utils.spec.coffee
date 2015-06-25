m = require('mochainon')
utils = require('../lib/utils')

describe 'Utils:', ->

	describe '.parse()', ->

		describe 'given a simple question', ->

			beforeEach ->
				@form = [
					message: 'Network type'
					name: 'network'
					type: 'input'
					default: 'wifi'
				]

			it 'should parse the question correctly', ->
				questions = utils.parse(@form)
				m.chai.expect(questions).to.deep.equal [
					message: 'Network type'
					name: 'network'
					type: 'input'
					default: 'wifi'
				]

		describe 'given a question with an when property', ->

			describe 'given a single value when', ->

				beforeEach ->
					@form = [
						message: 'Coprocessor cores'
						name: 'coprocessorCore'
						type: 'list'
						choices: [ '16', '64' ]
						when:
							processorType: 'Z7010'
					]

				it 'should return a when function', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when).to.be.a('function')

				it 'should return true if the condition is met', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when(processorType: 'Z7010')).to.be.true

				it 'should return false if the condition is not met', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when(processorType: 'Z7020')).to.be.false

				it 'should return false if the property does not exist', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when(foo: 'Z7020')).to.be.false

				it 'should return false if no answer', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when()).to.be.false
					m.chai.expect(questions[0].when({})).to.be.false

			describe 'given a multiple value when', ->

				beforeEach ->
					@form = [
						message: 'Coprocessor cores'
						name: 'coprocessorCore'
						type: 'list'
						choices: [ '16', '64' ]
						when:
							processorType: 'Z7010'
							hdmi: true
					]

				it 'should return true if all the conditions are met', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when(processorType: 'Z7010', hdmi: true)).to.be.true

				it 'should return false if any condition is not met', ->
					questions = utils.parse(@form)
					m.chai.expect(questions[0].when(processorType: 'Z7020', hdmi: false)).to.be.false
