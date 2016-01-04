resin-cli-form
--------------

[![npm version](https://badge.fury.io/js/resin-cli-form.svg)](http://badge.fury.io/js/resin-cli-form)
[![dependencies](https://david-dm.org/resin-io/resin-cli-form.png)](https://david-dm.org/resin-io/resin-cli-form.png)
[![Build Status](https://travis-ci.org/resin-io/resin-cli-form.svg?branch=master)](https://travis-ci.org/resin-io/resin-cli-form)
[![Build status](https://ci.appveyor.com/api/projects/status/hmvcyjfwbxqd1wru?svg=true)](https://ci.appveyor.com/project/jviotti/resin-cli-form)

Resin.io CLI form interpreter.

Role
----

The intention of this module is to provide an interpreter for our internal declarative form definitions.

Installation
------------

Install `resin-cli-form` by running:

```sh
$ npm install --save resin-cli-form
```

Documentation
-------------


* [form](#module_form)
  * [.run(form, [options])](#module_form.run) ⇒ <code>Promise.&lt;Object&gt;</code>
  * [.ask(question)](#module_form.ask) ⇒ <code>Promise.&lt;\*&gt;</code>

<a name="module_form.run"></a>
### form.run(form, [options]) ⇒ <code>Promise.&lt;Object&gt;</code>
**Kind**: static method of <code>[form](#module_form)</code>  
**Summary**: Run a form description  
**Returns**: <code>Promise.&lt;Object&gt;</code> - answers  
**Access:** public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| form | <code>Array.&lt;Object&gt;</code> |  | form description |
| [options] | <code>Object</code> | <code>{}</code> | options |
| [options.override] | <code>Object</code> |  | overrides |

**Example**  
```js
form.run [
	message: 'Processor'
	name: 'processorType'
	type: 'list'
	choices: [ 'Z7010', 'Z7020' ]
,
	message: 'Coprocessor cores'
	name: 'coprocessorCore'
	type: 'list'
	choices: [ '16', '64' ]
],

	# coprocessorCore will always be 64
	# Notice that the question will not be asked at all
	override:
		coprocessorCore: '64'

.then (answers) ->
	console.log(answers)
```
<a name="module_form.ask"></a>
### form.ask(question) ⇒ <code>Promise.&lt;\*&gt;</code>
**Kind**: static method of <code>[form](#module_form)</code>  
**Summary**: Run a single form question  
**Returns**: <code>Promise.&lt;\*&gt;</code> - answer  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| question | <code>Object</code> | form question |

**Example**  
```js
form.ask
	message: 'Processor'
	type: 'list'
	choices: [ 'Z7010', 'Z7020' ]
.then (processor) ->
	console.log(processor)
```

When
----

We use a `when` property to determine the conditions needed for a question to be asked. This property consists of an object determining the value name (as key), and the value it must have (as value) for the condition to hold. A `when` property can depend on one or more answers, by having many key value pairs.

Example:

```coffee
form.run [
	message: 'Network Type'
	name: 'network'
	type: 'list'
	choices: [ 'ethernet', 'wifi' ]
,
	message: 'Wifi Ssid'
	name: 'wifiSsid'
	type: 'input'
	when:
		network: 'wifi'
,
	message: 'Wifi Key'
	name: 'wifiKey'
	type: 'input'
	when:
		network: 'wifi'
]
```

In this case, the wifi ssid and wiki key will only be asked if the network type is `wifi`.

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/resin-cli-form/issues/new) on GitHub and the Resin.io team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ gulp test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io/resin-cli-form/issues](https://github.com/resin-io/resin-cli-form/issues)
- Source Code: [github.com/resin-io/resin-cli-form](https://github.com/resin-io/resin-cli-form)

Before submitting a PR, please make sure that you include tests, and that [coffeelint](http://www.coffeelint.org/) runs without any warning:

```sh
$ gulp lint
```

License
-------

The project is licensed under the Apache 2.0 license.
