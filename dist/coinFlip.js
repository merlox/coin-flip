// Set your escrow balance that you used in the smart contract
const globalPlayer1Escrow = web3.toWei(2, 'ether')
const globalPlayer2Escrow = web3.toWei(2, 'ether')

// How much money you have won or lost
let globalPlayer1Balance = globalPlayer1Escrow
let globalPlayer2Balance = globalPlayer2Escrow
let sequence = 0

// Contains the information of each player for each game
const games = []

// Here the information generated in your flip will be stored to reveal it later
let player1 = {}
let player2 = {}

// Generates the signed message and nonce of the coin flipping which allows you to commit to a coin flip call
// For instance "await playerOneFlip(true, web3.toWei(1))"
async function playerOneFlip(coinFlipResult, bet) {
	// 16 characters length random number
	const nonce = Math.floor(Math.random() * 1e16)

	// We need to hash all this information to later verify in the Smart Contract that it's all valid. The 4th argument is the final balance after playing some games
	const hash = generateHash(coinFlipResult, globalPlayer1Escrow, bet, globalPlayer1Balance.toString(), nonce, sequence)
	const signedMessage = await signMessage(hash)
	player1 = {
		signedMessage,
		coinFlipResult,
		escrow: globalPlayer1Escrow,
		bet,
		balance: globalPlayer1Balance,
		nonce,
		sequence,
		address: web3.eth.defaultAccount
	}

	if(games[games.length] === undefined) {
		games.push(new Array(player1))
	} else {
		games[games.length - 1].push(player1)
	}
	console.log('Player 1 data:', player1)

	sequence++
}

// Generates the signed message and nonce of the second player
// Usage "await playerTwoFlip(true, web3.toWei(1))"
async function playerTwoFlip(coinCall, bet) {
	// 16 characters length random number
	const nonce = Math.floor(Math.random() * 1e16)

	// We need to hash all this information to later verify in the Smart Contract that it's all valid. The 4th argument is the final balance after playing some games
	const hash = generateHash(coinCall, globalPlayer2Escrow, bet, globalPlayer2Balance.toString(), nonce, sequence)
	const signedMessage = await signMessage(hash)

	player2 = {
		signedMessage,
		coinCall,
		escrow: globalPlayer2Escrow,
		bet,
		balance: globalPlayer2Balance,
		nonce,
		sequence,
		address: web3.eth.defaultAccount
	}

	if(games[games.length - 1] === undefined) {
		games.push(new Array(player2))
	} else {
		games[games.length - 1].push(player2)
	}
	console.log('Player 2 data:', player2)

	sequence++
}

// Compares the 2 calls and shows the winner
function revealResult(player2SignedMessage, player2Address, player2Call, player2Escrow, player2Bet, player2Balance, player2Nonce, player2Sequence) {
	// Get all the data from the player and verify the validity of the information
	const isMessageValid = verifyMessage(player2SignedMessage, player2Address, player2Call, player2Escrow, player2Bet, player2Balance, player2Nonce, player2Sequence)

	if(!isMessageValid) {
		return console.log('The message is not valid, make sure to verify that the information is correct. Otherwise upload your 2 latest signed messages to the smart contract to draw a conclusion')
	}

	player2 = {
		signedMessage: player2SignedMessage,
		coinCall: player2Call,
		escrow: player2Escrow,
		bet: player2Bet,
		balance: player2Balance,
		nonce: player2Nonce,
		sequence: player2Sequence,
		address: player2Address
	}

	games[games.length - 1].push(player2)

	console.log('Player 2 data:', player2)

	// Update the balances
	if(player1.coinFlipResult == player2Call) {
		globalPlayer1Balance = parseInt(globalPlayer1Balance)
		globalPlayer2Balance = parseInt(globalPlayer2Balance)
		globalPlayer1Balance -= parseInt(player2Bet)
		globalPlayer2Balance += parseInt(player2Bet)
		console.log('Player 2 wins! The globalPlayer1Balance and globalPlayer2Balance have been updated')
	} else {
		globalPlayer1Balance = parseInt(globalPlayer1Balance)
		globalPlayer2Balance = parseInt(globalPlayer2Balance)
		globalPlayer1Balance += parseInt(player1.bet)
		globalPlayer2Balance -= parseInt(player1.bet)
		console.log('Player 1 wins! The globalPlayer1Balance and globalPlayer2Balance have been updated')
	}
}

// Checks that the message given by the player is valid to make sure the information is correct to continue playing and to reveal the results
function verifyMessage(playerSignedMessage, playerAddress, playerCall, playerEscrow, playerBet, playerBalance, playerNonce, playerSequence) {
	const hash = generateHash(playerCall, playerEscrow, playerBet, playerBalance, playerNonce, playerSequence)
	const message = ethereumjs.ABI.soliditySHA3(
		['string', 'bytes32'],
		['\x19Ethereum Signed Message:\n32', hash]
	)
	const splitSignature = ethereumjsUtil.fromRpcSig(playerSignedMessage)
	const publicKey = ethereumjsUtil.ecrecover(message, splitSignature.v, splitSignature.r, splitSignature.s)
	const signer = ethereumjsUtil.pubToAddress(publicKey).toString('hex')
	const isMessageValid = (signer.toLowerCase() == ethereumjsUtil.stripHexPrefix(playerAddress).toLowerCase())
	return isMessageValid
}

// An utility to generate hashes
function generateHash(coinFlipResult, escrowBalance, bet, balance, nonce, sequence) {
	const hash = '0x' + ethereumjs.ABI.soliditySHA3(
		['bool', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
		[coinFlipResult, escrowBalance, bet, balance, nonce, sequence]
	).toString('hex')

	return hash
}

// To sign the generated hash with your web3 account required to guarantee that you created it
function signMessage(hash) {
	return new Promise((resolve, reject) => {
		web3.personal.sign(hash, web3.eth.defaultAccount, (err, result) => {
			if(err) return reject(err)
			resolve(result)
		})
	})
}
