const form = require('..')

form.ask({
	message: 'Processor',
	type: 'list',
	choices: [ 'Z7010', 'Z7020' ]
})
.then((processor) => {
	console.log('')
	console.log(processor)
})
.catch((error) => {
	console.error(error)
})
