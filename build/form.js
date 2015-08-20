
/*
The MIT License

Copyright (c) 2015 Resin.io, Inc. https://resin.io.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

/**
 * @module form
 */
var Promise, inquirer, utils, visuals, _;

Promise = require('bluebird');

_ = require('lodash');

inquirer = require('inquirer');

visuals = require('resin-cli-visuals');

utils = require('./utils');


/**
 * @summary Run a form description
 * @function
 * @public
 *
 * @param {Object[]} form - form description
 * @returns {Promise<Object>} answers
 *
 * @example
 * form.run [
 * 	message: 'Processor'
 * 	name: 'processorType'
 * 	type: 'list'
 * 	choices: [ 'Z7010', 'Z7020' ]
 * ,
 * 	message: 'Coprocessor cores'
 * 	name: 'coprocessorCore'
 * 	type: 'list'
 * 	choices: [ '16', '64' ]
 * ]
 * .then (answers) ->
 * 	console.log(answers)
 */

exports.run = function(form) {
  var questions;
  questions = utils.parse(form);
  return Promise.reduce(questions, function(answers, question) {
    return utils.prompt([question]).then(function(answer) {
      return _.assign(answers, answer);
    });
  }, {});
};


/**
 * @summary Run a single form question
 * @function
 * @public
 *
 * @param {Object} question - form question
 * @returns {Promise<*>} answer
 *
 * @example
 * form.ask
 * 	message: 'Processor'
 * 	type: 'list'
 * 	choices: [ 'Z7010', 'Z7020' ]
 * .then (processor) ->
 * 	console.log(processor)
 */

exports.ask = function(question, callback) {
  if (question.name == null) {
    question.name = 'question';
  }
  return exports.run([question]).get(question.name);
};
