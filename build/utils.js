
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
var _;

_ = require('lodash');


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
    result = _.cloneDeep(option);
    if (!_.isEmpty(option.when)) {
      result.when = function(answers) {
        if (answers == null) {
          return false;
        }
        return _.findWhere([answers], option.when) != null;
      };
    }
    return result;
  });
};
