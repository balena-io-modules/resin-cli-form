const form = require('..')

form.run([
	{
		message: 'Network Type',
		name: 'network',
		type: 'list',
		choices: [ 'ethernet', 'wifi' ]
	},
	{
		message: 'Wifi Ssid',
		name: 'wifiSsid',
		type: 'input',
		when: {
			network: 'wifi'
		}
	},
	{
		message: 'Wifi Key',
		name: 'wifiKey',
		type: 'input',
		when: {
			network: 'wifi'
		}
	}
])
.then((processor) => {
	console.log('')
	console.log(processor)
})
.catch((error) => {
	console.error(error)
})

