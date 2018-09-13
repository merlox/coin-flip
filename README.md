# Coin flip game

To prepare it, install ethereumjs-abi by executing `npm i`

Then decide the result of the coin flip by modifying the parameter of the function `flip` inside `coinFlip.js`

Finally execute it with `node coinFlip`. You'll see your generated hash with the encrypted data which you can upload to the smart contract as your commitment and the nonce which will be required for revealing the date later

In the Smart Contract do the following to play the game:
1. Deploy it with the hash and the address of the player in the constructor. Remember to also send the required bet in ETH
2. 
