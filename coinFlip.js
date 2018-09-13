const abi = require('ethereumjs-abi')

function flip(coinFlipResult) {
	const nonce = Math.floor(Math.random()*1e16).toString() // 16 characters length random number
	const hash = '0x' + abi.soliditySHA3(
		['bool', 'uint256'],
		[coinFlipResult, nonce]
	).toString('hex')

	console.log('\nYour hash:')
	console.log('-------------')
	console.log(hash)
	console.log('\nYour nonce:')
	console.log('-----------')
	console.log(nonce + '\n')
}

flip(true)
