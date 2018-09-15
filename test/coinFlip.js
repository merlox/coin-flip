// This is the test file of the contract to verify all the functions
const CoinFlip = artifacts.require('CoinFlip')
const assert = require('assert')
const ethereumjs = require('./../dist/abi.js')
const util = require('./../dist/util.js')
const coinFlipUtilities = require('./../dist/coinFlip.js')
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
        const signedMessage = "0x1746a919d75ed40e7c5c400280a9e6f64bedc5384d8dea232b2c52e3fe5cc75428fdd965251d0616f8726c0f228c8f29b1d9a59544d3eeb3eeabad80b5a8e9121c"
        const call = true
        const bet = web3.toWei(0.3, 'ether')
        const balance = "1000000000000000000"
        const nonce = 2538809386906522
        const sequence = 0

        // Deploy a new contract

        // Setup player 2

        console.log('abi', ethereumjs)
        console.log('util', util)
        // Generate the message
        const flipResult = await coinFlipUtilities.playerOneFlip(call, bet)
        console.log('flip result', flipResult)
        // Sign it
    })
    it('The verifyPlayerBalance() function should set up the variables to finish the game')
    it('The finish() function should distribute the funds correctly when both player\'s balances are set up')
})
