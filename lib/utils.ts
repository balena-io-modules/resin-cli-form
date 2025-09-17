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

import Promise from 'bluebird';
import * as _ from 'lodash';
import inquirer from 'inquirer';

export type TypeOrPromiseLike<T> = T | PromiseLike<T>;

export type Validate = (
	input: any,
) => TypeOrPromiseLike<boolean | string | undefined>;

export interface Options<T> {
	isGroup?: boolean;
	message: string;
	type?: string;
	name: string;
	default?: T;
	when?: Record<string, number | string | boolean>;
	choices?: Array<{
		name: string;
		value: T;
	}>;
	options?: Array<Options<unknown>>;
	validate?: Validate;
}

export interface ParsedAskOptions extends Options<unknown> {
	shouldPrompt?: (answers: Record<string, unknown>) => boolean;
}

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
export const flatten = (
	form: Array<Options<unknown>>,
): Array<Options<unknown>> =>
	_.flatMap(form, function (question) {
		if (question.isGroup) {
			return flatten(question.options ?? []);
		}
		return question;
	});

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
export const parse = function (
	form: Array<Options<unknown>>,
): ParsedAskOptions[] {
	form = flatten(form);

	return _.map(form, function (option) {
		// We omit `when` since we internally translate this
		// into a `shouldPrompt` function instead.
		const { when, ...result } = _.cloneDeep(option) as ParsedAskOptions;

		// Translate object "when" definitions
		// to functions we can run and evaluate
		if (!_.isEmpty(when)) {
			result.shouldPrompt = function (answers) {
				if (answers == null) {
					return false;
				}

				return _.every(when, function (value, key) {
					const answer = _.get(answers, key);

					// Evaluate `true` as an existencial operator
					if (value === true && Boolean(answer)) {
						return true;
					}

					return answer === value;
				});
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
export const prompt = Promise.method((questions: Array<Options<unknown>>) =>
	inquirer.prompt(questions),
);
