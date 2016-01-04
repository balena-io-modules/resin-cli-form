###
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

###*
# @module form
###

Promise = require('bluebird')
_ = require('lodash')
inquirer = require('inquirer')
visuals = require('resin-cli-visuals')
utils = require('./utils')

###*
# @summary Run a form description
# @function
# @public
#
# @param {Object[]} form - form description
# @param {Object} [options={}] - options
# @param {Object} [options.override] - overrides
#
# @returns {Promise<Object>} answers
#
# @example
# form.run [
# 	message: 'Processor'
# 	name: 'processorType'
# 	type: 'list'
# 	choices: [ 'Z7010', 'Z7020' ]
# ,
# 	message: 'Coprocessor cores'
# 	name: 'coprocessorCore'
# 	type: 'list'
# 	choices: [ '16', '64' ]
# ],
#
# 	# coprocessorCore will always be 64
# 	# Notice that the question will not be asked at all
# 	override:
# 		coprocessorCore: '64'
#
# .then (answers) ->
# 	console.log(answers)
###
exports.run = (form, options = {}) ->
	questions = utils.parse(form)

	Promise.reduce questions, (answers, question) ->

		# Since we now run `reduce` over the questions and run
		# inquirer inputs in an isolated way, `when` functions
		# no longer make sense to inquirer.
		# Therefore, we implement `when` checking manually
		# here based on `shouldPrompt`.
		if question.shouldPrompt? and not question.shouldPrompt(answers)
			return answers

		override = _.get(options.override, question.name)

		if override?
			validation = (question.validate or _.constant(true))(override)

			if _.isString(validation)
				throw new Error(validation)

			if not validation
				throw new Error("#{override} is not a valid #{question.name}")

			answers[question.name] = override
			return answers

		if question.type is 'drive'
			visuals.drive(question.message).then (drive) ->
				answers[question.name] = drive
				return answers
		else
			utils.prompt([ question ]).then (answer) ->
				return _.assign(answers, answer)
	, {}

###*
# @summary Run a single form question
# @function
# @public
#
# @param {Object} question - form question
# @returns {Promise<*>} answer
#
# @example
# form.ask
# 	message: 'Processor'
# 	type: 'list'
# 	choices: [ 'Z7010', 'Z7020' ]
# .then (processor) ->
# 	console.log(processor)
###
exports.ask = (question) ->
	question.name ?= 'question'
	exports.run([ question ]).get(question.name)
