# Coin flip game

To prepare it, install ethereumjs-abi by executing `npm i`

Then decide the result of the coin flip by modifying the parameter of the function `flip` inside `coinFlip.js`

Finally execute it with `node coinFlip`. You'll see your generated hash with the encrypted data which you can upload to the smart contract as your commitment and the nonce which will be required for revealing the date later

In the Smart Contract do the following to play the game:
1. Deploy it with the `hash` and the `address` of the player in the constructor. Remember to also send the required `bet` in ETH as the `msg.value`
2. Now wait for the other player to make the bet by executing the function `makeChoice`
3. Then the flipper or player 1 reveals the winner by executing `revealResult`
4. If the flipper doesn't want to reveal the result because he knows that he will lose, the player 2 can take the reward after the expiration time of 10 hours by executing `expireGame`
5. After revealing the result or expiring the game, the flipper can start another with the function `startNewGame` using a hash and setting a player
