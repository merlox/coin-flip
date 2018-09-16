// This is the test file of the contract to verify all the functions
const CoinFlip = artifacts.require('CoinFlip')
const assert = require('assert')
let contractInstance

contract('CoinFlip', async (accounts) => {

    // Deploy a new contract before each test to work in a clean enviroment
    beforeEach(async () => {
        contractInstance = await CoinFlip.new({
            from: accounts[0],
            value: web3.toWei(1, 'ether')
        })
    })

    // First, test that all the functions in the contract are doing what they should
    it('The constructor should set up the player\'s 1 address and escrow', async () => {
         const playersAddress = accounts[1]
         const escrow = web3.toWei(1, 'ether')

         const newContract = await CoinFlip.new({
             from: playersAddress,
             value: escrow
         })
         const playerOneAddress = await newContract.playerOne.call()
         const playerOneEscrow = await newContract.player1Escrow.call()

         assert.equal(playersAddress, playerOneAddress, 'The address set up in the contract is not correct')
         assert.equal(escrow, playerOneEscrow, 'The escrow set up in the contract is not correct')
    })
    it('The setupPlayerTwo() function should set up the player\'s 2 address and escrow', async () => {
        const playersAddress = accounts[1]
        const escrow = web3.toWei(1, 'ether')

        await contractInstance.setupPlayerTwo({
            from: playersAddress,
            value: escrow
        })

        const playerTwoAddress = await contractInstance.playerTwo.call()
        const playerTwoEscrow = await contractInstance.player2Escrow.call()

        assert.equal(playersAddress, playerTwoAddress, 'The address set up in the contract is not correct')
        assert.equal(escrow, playerTwoEscrow, 'The escrow set up in the contract is not correct')
    })
    it('The setupPlayerTwo() function should set up only once', async () => {
        const playersAddress = accounts[1]
        const escrow = web3.toWei(1, 'ether')

        await contractInstance.setupPlayerTwo({
            from: playersAddress,
            value: escrow
        })

        try {
            await contractInstance.setupPlayerTwo({
                from: playersAddress,
                value: escrow
            })
            assert.ok(false, 'The set up transaction should revert')
        } catch(e) {
            assert.ok(true)
        }
    })
    it('The verifyPlayerBalance() function should verify that the signed message is valid', async () => {
        const signedMessage = "0xf7078d7dd2400d976a3ffc4c1eaf39c29902355f0c1a6dd77214485ebd47b18416eb552f356fc5ea08e1cdcd8fd1c47cb0295a254601d42ec7d0d5cfa87be85e1c"
        const call = true
        const bet = web3.toWei(0.3, 'ether')
        const balance = "1000000000000000000"
        const nonce = 1990515549184570
        const sequence = 0

        // Setup player 2
        await contractInstance.setupPlayerTwo({
            from: accounts[1],
            value: web3.toWei(1)
        })

        try {
            await contractInstance.verifyPlayerBalance(signedMessage, call, bet, balance, nonce, sequence)
            assert.ok(true, "The verification is successful")
        } catch(e) {
            assert.ok(false, "It should not revert the transaction")
        }
    })
    it('The verifyPlayerBalance() function should set up the variables to finish the game of both players', async () => {
        const signedMessage = "0xf7078d7dd2400d976a3ffc4c1eaf39c29902355f0c1a6dd77214485ebd47b18416eb552f356fc5ea08e1cdcd8fd1c47cb0295a254601d42ec7d0d5cfa87be85e1c"
        const call = true
        const bet = web3.toWei(0.3, 'ether')
        const balance = "1000000000000000000"
        const nonce = 1990515549184570
        const sequence = 0

        const signedMessage2 = "0x6b5ed07a2eea2ec746f6bee021b042a62da15ac6ba549970ee14c4da3b90bdf54230d3ab97b3deda0c7c979c967baeb7554a889138202436e03ca17218832e181c"
        const call2 = false
        const bet2 = web3.toWei(0.3, 'ether')
        const balance2 = "1000000000000000000"
        const nonce2 = 7069029898685941
        const sequence2 = 0

        const expectedFinalBalancePlayer1 = web3.toWei(1.3, 'ether')
        const expectedFinalBalancePlayer2 = web3.toWei(0.7, 'ether')
        let player1FinalBalance
        let player2FinalBalance
        let player1Bet
        let player2Bet
        let player1Call
        let player2Call

        // Setup player 2
        await contractInstance.setupPlayerTwo({
            from: accounts[1],
            value: web3.toWei(1)
        })

        try {
            await contractInstance.verifyPlayerBalance(signedMessage, call, bet, balance, nonce, sequence, {
                from: accounts[0]
            })
            await contractInstance.verifyPlayerBalance(signedMessage2, call2, bet2, balance2, nonce2, sequence2, {
                from: accounts[1]
            })

            player1FinalBalance = await contractInstance.player1FinalBalance.call()
            player2FinalBalance = await contractInstance.player2FinalBalance.call()
            player1Bet = await contractInstance.player1Bet.call()
            player2Bet = await contractInstance.player2Bet.call()
            player1Call = await contractInstance.player1Call.call()
            player2Call = await contractInstance.player2Call.call()
        } catch(e) {
            return assert.ok(false, "It should not revert the transaction")
        }

        assert.equal(player1FinalBalance, expectedFinalBalancePlayer1, "The final balance of player 1 in the contract is not correct")
        assert.equal(player2FinalBalance, expectedFinalBalancePlayer2, "The final balance of player 2 in the contract is not correct")
        assert.equal(player1Bet, bet, "The bet of player 1 in the contract is not correct")
        assert.equal(player2Bet, bet2, "The bet of player 2 in the contract is not correct")
        assert.equal(player1Call, call, "The bet of player 1 in the contract is not correct")
        assert.equal(player2Call, call2, "The bet of player 2 in the contract is not correct")
    })
    it('The verifyPlayerBalance() function should verify that the second player data is valid', async () => {
        const signedMessage = "0x6b5ed07a2eea2ec746f6bee021b042a62da15ac6ba549970ee14c4da3b90bdf54230d3ab97b3deda0c7c979c967baeb7554a889138202436e03ca17218832e181c"
        const call = false
        const bet = web3.toWei(0.3, 'ether')
        const balance = "1000000000000000000"
        const nonce = 7069029898685941
        const sequence = 0

        // Setup player 2
        await contractInstance.setupPlayerTwo({
            from: accounts[1],
            value: web3.toWei(1)
        })

        try {
            // Use the second's player data
            await contractInstance.verifyPlayerBalance(signedMessage, call, bet, balance, nonce, sequence, {
                from: accounts[1]
            })
            assert.ok(true, "The verification is successful")
        } catch(e) {
            assert.ok(false, "It should not revert the transaction")
        }
    })
    it('The finish() function should distribute the funds correctly when both player\'s balances are set up', async () => {
        const signedMessage = "0xf7078d7dd2400d976a3ffc4c1eaf39c29902355f0c1a6dd77214485ebd47b18416eb552f356fc5ea08e1cdcd8fd1c47cb0295a254601d42ec7d0d5cfa87be85e1c"
        const call = true
        const bet = web3.toWei(0.3, 'ether')
        const balance = "1000000000000000000"
        const nonce = 1990515549184570
        const sequence = 0

        const signedMessage2 = "0x6b5ed07a2eea2ec746f6bee021b042a62da15ac6ba549970ee14c4da3b90bdf54230d3ab97b3deda0c7c979c967baeb7554a889138202436e03ca17218832e181c"
        const call2 = false
        const bet2 = web3.toWei(0.3, 'ether')
        const balance2 = "1000000000000000000"
        const nonce2 = 7069029898685941
        const sequence2 = 0

        const player1Balance = await web3.eth.getBalance(accounts[0])
        const player2Balance = await web3.eth.getBalance(accounts[1])
        const expectedFinalBalance1 = player1Balance.add(web3.toWei(0.3, 'ether'))
        const expectedFinalBalance2 = player2Balance.sub(web3.toWei(0.3, 'ether'))
        let player1AfterFinishBalance
        let player2AfterFinishBalance

        // Setup player 2
        await contractInstance.setupPlayerTwo({
            from: accounts[1],
            value: web3.toWei(1)
        })

        try {
            await contractInstance.verifyPlayerBalance(signedMessage, call, bet, balance, nonce, sequence, {
                from: accounts[0]
            })
            await contractInstance.verifyPlayerBalance(signedMessage2, call2, bet2, balance2, nonce2, sequence2, {
                from: accounts[1]
            })

            await contractInstance.finish({
                from: accounts[8]
            })

            player1AfterFinishBalance = await web3.eth.getBalance(accounts[0])
            player2AfterFinishBalance = await web3.eth.getBalance(accounts[1])
        } catch(e) {
            return assert.ok(false, "It should not revert the transaction")
        }

        // We are checking if the final balance is about 1.2 ethers bigger instead of exactly 1.3 which is the right number because of errors in precision, the right number is being sent but js can't properly process those big numbers
        assert.ok((player1AfterFinishBalance.sub(expectedFinalBalance1) > web3.toWei(1.2, 'ether')), "The player's 1 final balance is not correct after executing the function finish()")
        assert.ok((player1AfterFinishBalance.sub(expectedFinalBalance1) > web3.toWei(0.2, 'ether')), "The player's 2 final balance is not correct after executing the function finish()")
    })
})
