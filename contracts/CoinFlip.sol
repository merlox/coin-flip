pragma solidity 0.4.24;

// In this game of 2 players, the first one decides the result of the coin flip as if he's flipped a coin in real life. Then, the second player commits to a choice and any of them player can reveal the final result to send the reward to the winner after several games by verifying each player's balance with verifyPlayerBalance() and executing finish().
contract CoinFlip {
    address public playerOne;
    address public playerTwo;
    uint256 public expirationTime = 2**256-1; // Almost infinite
    uint256 public player1Escrow;
    uint256 public player2Escrow;

    // State variables to finish the game
    uint256 public player1Balance;
    uint256 public player2Balance;
    bool public isPlayer1BalanceSetUp;
    bool public isPlayer2BalanceSetUp;
    uint256 public player1FinalBalance;
    uint256 public player2FinalBalance;
    uint256 public player1Bet;
    uint256 public player2Bet;
    bool public player1Call;
    bool public player2Call;

    /// @notice The constructor used to set up a new coin flip game. The flipper pays the bet to play
    constructor() public payable {
        playerOne = msg.sender;
        player1Escrow = msg.value;
    }

    /// @notice To set up the escrow of the second player. Can only be executed once
    function setupPlayerTwo() public payable {
        require(playerTwo == address(0));
        player2Escrow = msg.value;
        playerTwo = msg.sender;
    }

    /// @notice To verify and save the player balance to distribute it later when the game is completed. The msg.sender is important to decide which balance is being updated
    function verifyPlayerBalance(bytes playerMessage, bool playerCall, uint256 playerBet, uint256 playerBalance, uint256 playerNonce, uint256 playerSequence) public {
        require(playerTwo != address(0));
        require(playerMessage.length == 65);
        uint256 escrowToUse = player1Escrow;

        if(msg.sender == playerTwo) escrowToUse = player2Escrow;

        // Recreate the signed message for the first player to verify that the parameters are correct
        bytes32 message = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(playerCall, escrowToUse, playerBet, playerBalance, playerNonce, playerSequence))));
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(playerMessage, 32))
            s := mload(add(playerMessage, 64))
            v := byte(0, mload(add(playerMessage, 96)))
        }

        address originalSigner = ecrecover(message, v, r, s);
        require(originalSigner == msg.sender);

        if(msg.sender == playerOne) {
            player1Balance = playerBalance;
            isPlayer1BalanceSetUp = true;
            player1Bet = playerBet;
            player1Call = playerCall;
        } else {
            player2Balance = playerBalance;
            isPlayer2BalanceSetUp = true;
            player2Bet = playerBet;
            player2Call = playerCall;
        }

        if(isPlayer1BalanceSetUp && isPlayer2BalanceSetUp) {
            if(player1Call == player2Call) {
                player2FinalBalance = player2Balance + player2Bet;
                player1FinalBalance = player1Balance - player2Bet;
            } else {
                player1FinalBalance = player1Balance + player1Bet;
                player2FinalBalance = player2Balance - player1Bet;
            }
        }
    }

    /// @notice To finish the game and send the winner funds
    function finish() public {
        require(isPlayer1BalanceSetUp && isPlayer2BalanceSetUp);
        playerOne.transfer(player1FinalBalance);
        playerTwo.transfer(player2FinalBalance);
    }
}
