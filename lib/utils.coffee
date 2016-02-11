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

Promise = require('bluebird')
_ = require('lodash')
inquirer = require('inquirer')

###*
# @summary Flatten form groups
# @function
# @protected
#
# @param {Object[]} form - form description
# @returns {Object[]} flattened form description
#
# @example
# questions = utils.flatten [
# 	isGroup: true
# 	name: 'network'
# 	message: 'Network'
# 	isCollapsible: true
# 	collapsed: false
# 	options: [
# 		message: 'Network Connection'
# 		name: 'network'
# 		type: 'list'
# 		choices: [ 'ethernet', 'wifi' ]
# ,
# 	message: 'Processor'
# 	name: 'processorType'
# 	type: 'list'
# 	choices: [ 'Z7010', 'Z7020' ]
# ]
###
exports.flatten = (form) ->
	return _.flatten _.map form, (question) ->
		if question.isGroup
			return exports.flatten(question.options)
		return question

###*
# @summary Parse a form definition
# @function
# @protected
#
# @param {Object[]} form - form description
# @returns {Object[]} parsed questions
#
# @example
# questions = utils.parse [
# 	message: 'Processor'
# 	name: 'processorType'
# 	type: 'list'
# 	choices: [ 'Z7010', 'Z7020' ]
# ,
# 	message: 'Coprocessor cores'
# 	name: 'coprocessorCore'
# 	type: 'list'
# 	values: [ '16', '64' ]
# ]
###
exports.parse = (form) ->
	form = exports.flatten(form)

	return _.map form, (option) ->

		# We omit `when` since we internally translate this
		# into a `shouldPrompt` function instead.
		result = _.omit(_.cloneDeep(option), 'when')

		# Translate object "when" definitions
		# to functions we can run and evaluate
		if not _.isEmpty(option.when)
			result.shouldPrompt = (answers) ->
				return false if not answers?

				return _.all _.map option.when, (value, key) ->
					answer = _.get(answers, key)

					# Evaluate `true` as an existencial operator
					if value is true and Boolean(answer)
						return true

					return answer is value

		return result

###*
# @summary Prompt a questions form
# @function
# @protected
#
# @param {Object[]} questions - form questions
# @returns {Promise<Object>} answers
#
# @example
# utils.prompt [
# 	message: 'Processor'
# 	name: 'processorType'
# 	type: 'list'
# 	choices: [ 'Z7010', 'Z7020' ]
# ,
# 	message: 'Coprocessor cores'
# 	name: 'coprocessorCore'
# 	type: 'list'
# 	values: [ '16', '64' ]
# ]
# .then (answers) ->
# 	console.log(answers.processorType)
# 	console.log(answers.coprocessorCore)
###
exports.prompt = (questions) ->
	Promise.fromNode (callback) ->
		inquirer.prompt questions, (answers) ->
			return callback(null, answers)
