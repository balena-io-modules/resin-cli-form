const form = require('..')

form.run([
	{
		message: 'Processor',
		name: 'processorType',
		type: 'list',
		choices: [ 'Z7010', 'Z7020' ]
	},
	{
		message: 'Coprocessor cores',
		name: 'coprocessorCore',
		type: 'list',
		choices: [ '16', '64' ]
	}
],{
	// coprocessorCore will always be 64
	// Notice that the question will not be asked at all
	override: {
		coprocessorCore: '64'
	}
})
.then((answers) => {
	console.log('')
	console.log(answers)
})
.catch((error) => {
	console.error(error)
})
