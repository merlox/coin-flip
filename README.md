# Coin flip game

## DESCRIPTION
This game uses commitment schemes and state channels to upload the result of the coin flip to the Ethereum blockchain without showing what is inside for later revealing it, after the second player has made a bet. It uses a node.js script called `coinFlip.js` to generate encrypted hashes using a random nonce with your desired coin flip result. Along with a Smart Contract that handles the logic.

## PREPARATION
- You need metamask to run this application in order to sign the messages
- Install `truffle` globally with `npm i -g truffle` to execute the tests
- Install `http-server` globally with `npm i -g http-server` to create a static server and to make the application work with metamask

Execute `npm run web` to start the static server. Then go to `localhost:8080` to start using the application with the developer tools of the browser and the javascript console by openning them with `F12` on windows.

## HOW TO PLAY
**In the Smart Contract:**
1. The first player deploys the smart contract with his `escrow` as the `msg.value` in the constructor.
2. The second player executes the function `setupPlayerTwo()` with his `escrow` as the `msg.value`. Then they can start playing off-chain in javascript.

**In javascript:**
1. Both players set up the `escrow` amounts invested in the smart contract in the variables `globalPlayer1Escrow` and `globalPlayer2Escrow` at the top of the file `dist/coinFlip.js`
2. The first player decides the future result of the coin flip and the second player has to guess it. To start, he has to execute the function `playerOneFlip()` with the result as the first parameter and the ether to `bet` as the second parameter. The winner gets double the bet money.
3. The second player receives the signed message of the first player with his commitment via email or similar. Then he executes the function `playerTwoFlip()` with his call and the amount bet in wei. For instance: `playerTwoBet(false, web3.toWei(0.1, 'ether'))`
4. The first player receives the signed message of the second player along with his `address`, his `call`, his `escrow`, his `bet`, his game `balance`, his secret `nonce` and the `sequence` of the message to execute the function `revealResult()` using those parameters. Those variables are shown to each user after executing the corresponding `flip` functions.
5. Both players can continue betting until they run out of escrow. To finish the game go to the deployed smart contract and execute the function `finish()` which requires the 2 latest messages with all the variables above.
6. If they don't agree at any point of the game, any of them can go to the contract to execute the function `startResolution()` which requires the latest messages of each player (2 in total) with the relative information to verify them. After that, the other player has a timeout to upload 2 more recent signed messages to give him the option to defend himself.

- constructor
- setupPlayerTwo
- finish
- startResolution
