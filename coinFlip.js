const abi = require('ethereumjs-abi')
const crypto = require('crypto')

function flip(coinFlipResult) {
	const nonce = '0x' + crypto.randomBytes(32).toString('hex')
	const hash = '0x' + abi.soliditySHA3(
		['bool', 'uint256'],
		[coinFlipResult, nonce]
	).toString('hex')

	console.log('\nYour hash:')
	console.log('-------------')
	console.log(hash + '\n')
}

flip(true)
