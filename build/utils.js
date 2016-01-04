
/*
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
 */
var Promise, inquirer, _;

Promise = require('bluebird');

_ = require('lodash');

inquirer = require('inquirer');


/**
 * @summary Flatten form groups
 * @function
 * @protected
 *
 * @param {Object[]} form - form description
 * @returns {Object[]} flattened form description
 *
 * @example
 * questions = utils.flatten [
 * 	isGroup: true
 * 	name: 'network'
 * 	message: 'Network'
 * 	isCollapsible: true
 * 	collapsed: false
 * 	options: [
 * 		message: 'Network Connection'
 * 		name: 'network'
 * 		type: 'list'
 * 		choices: [ 'ethernet', 'wifi' ]
 * ,
 * 	message: 'Processor'
 * 	name: 'processorType'
 * 	type: 'list'
 * 	choices: [ 'Z7010', 'Z7020' ]
 * ]
 */

exports.flatten = function(form) {
  return _.flatten(_.map(form, function(question) {
    if (question.isGroup) {
      return exports.flatten(question.options);
    }
    return question;
  }));
};


/**
 * @summary Parse a form definition
 * @function
 * @protected
 *
 * @param {Object[]} form - form description
 * @returns {Object[]} parsed questions
 *
 * @example
 * questions = utils.parse [
 * 	message: 'Processor'
 * 	name: 'processorType'
 * 	type: 'list'
 * 	choices: [ 'Z7010', 'Z7020' ]
 * ,
 * 	message: 'Coprocessor cores'
 * 	name: 'coprocessorCore'
 * 	type: 'list'
 * 	values: [ '16', '64' ]
 * ]
 */

exports.parse = function(form) {
  form = exports.flatten(form);
  return _.map(form, function(option) {
    var result;
    result = _.omit(_.cloneDeep(option), 'when');
    if (!_.isEmpty(option.when)) {
      result.shouldPrompt = function(answers) {
        if (answers == null) {
          return false;
        }
        return _.findWhere([answers], option.when) != null;
      };
    }
    return result;
  });
};


/**
 * @summary Prompt a questions form
 * @function
 * @protected
 *
 * @param {Object[]} questions - form questions
 * @returns {Promise<Object>} answers
 *
 * @example
 * utils.prompt [
 * 	message: 'Processor'
 * 	name: 'processorType'
 * 	type: 'list'
 * 	choices: [ 'Z7010', 'Z7020' ]
 * ,
 * 	message: 'Coprocessor cores'
 * 	name: 'coprocessorCore'
 * 	type: 'list'
 * 	values: [ '16', '64' ]
 * ]
 * .then (answers) ->
 * 	console.log(answers.processorType)
 * 	console.log(answers.coprocessorCore)
 */

exports.prompt = function(questions) {
  return Promise.fromNode(function(callback) {
    return inquirer.prompt(questions, function(answers) {
      return callback(null, answers);
    });
  });
};
