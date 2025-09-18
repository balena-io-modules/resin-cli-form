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

/**
 * @module form
 */

import * as _ from 'lodash';
import visuals from 'resin-cli-visuals';
import * as utils from './utils';
import type { AskOptions } from './utils';
export type { TypeOrPromiseLike, Validate, AskOptions } from './utils';

/**
 * @summary Run a form description
 * @function
 * @public
 *
 * @param {Object[]} form - form description
 * @param {Object} [options={}] - options
 * @param {Object} [options.override] - overrides
 *
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
 * ],
 *
 * 	# coprocessorCore will always be 64
 * 	# Notice that the question will not be asked at all
 * 	override:
 * 		coprocessorCore: '64'
 *
 * .then (answers) ->
 * 	console.log(answers)
 */
export const run = async function (
	form: Array<AskOptions<unknown>>,
	options?: { override?: object },
) {
	options ??= {};
	const questions = utils.parse(form);

	const answers = {} as Record<string, unknown>;
	for (const question of questions) {
		// Since we now run `reduce` over the questions and run
		// inquirer inputs in an isolated way, `when` functions
		// no longer make sense to inquirer.
		// Therefore, we implement `when` checking manually
		// here based on `shouldPrompt`.
		if (question.shouldPrompt != null && !question.shouldPrompt(answers)) {
			continue;
		}

		const override = _.get(options.override, question.name);

		if (override != null) {
			const validation = (question.validate ?? _.constant(true))(override);

			if (_.isString(validation)) {
				throw new Error(validation);
			}

			if (!validation) {
				throw new Error(`${override} is not a valid ${question.name}`);
			}

			answers[question.name] = override;
			continue;
		}

		if (question.type === 'drive') {
			const drive = await visuals.drive(question.message);
			answers[question.name] = drive;
		} else {
			const answer = await utils.prompt([question]);
			if (_.isEmpty(_.trim(answer[question.name]))) {
				continue;
			}

			_.assign(answers, answer);
		}
	}
	return answers;
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
export const ask = async function <T = string>(question: AskOptions<T>) {
	question.name ??= 'question';
	const answers = await run([question]);
	return answers[question.name];
};
