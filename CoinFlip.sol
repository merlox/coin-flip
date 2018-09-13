pragma solidity 0.4.24;

// In this game of 2 players, the first one decides the result of the coin flip as if he's flipped a coin in real life. Then, the second player commits to a choice and any of them player can reveal the final result to send the reward to the winner.

// 1. The flipper decides the result when deploying the contract, how? with a hashed commitment message that contains a boolean value with the result where true = heads, false = tails. The hashed commitment message is secure because it's encrypted with a random 32 characters number nonce. This means that you can't override the final result with your own desired result as the player. You don't need to hash the address of the flipper because the message is already secure with such a big random number. The flipper also pays the minimum bet to play.

// 2. The player chooses an expected result and pays the bet for playing. He chooses true or false.

// 3. After the player has made his choice. Any of the two participants can reveal the result and get paid if they win.

// The idea is that the flipper and the player run several games making bets each time

contract CoinFlip {
    uint256 public bet = 2 ether;
    address public flipper = msg.sender;
    bytes32 public flippersCommitment;
    address public player;
    bool public playersChoice;
    bool public playerMadeChoice = false;
    bool public resultRevealed = false;

    modifier onlyFlipper() {
        require(msg.sender == flipper);
        _;
    }

    modifier onlyPlayer() {
        require(msg.sender == player);
        _;
    }

    /// @notice The constructor used to set up a new coin flip game. The flipper pays the bet to play
    /// @param _flippersCommitment The result of flipping a coin, encrypted with a random nonce and the boolean result
    /// @param _player The address of the player that will participate in the game
    constructor(bytes32 _flippersCommitment, address _player) public payable {
        require(_player != address(0));
        require(msg.value == bet);
        flippersCommitment = _flippersCommitment;
        player = _player;
    }

    /// @notice The function that the player executes when he wants to make his choice by paying the bet
    /// @param _playersChoice The boolean choice where true = heads and false = tails
    function makeChoice(bool _playersChoice) public payable onlyPlayer {
        require(msg.value == bet);
        require(!playerMadeChoice);
        playersChoice = _playersChoice;
        playerMadeChoice = true;
    }

    /// @notice Reveals the choices from the flipper and player to determine the winner. If the player made the right call, he gets the ether. If he fails, the flipper gets the ether bet. Any one of the participants can execute this function because it requires that the player has made his choice. The random 32 number nonce is required to reveal the result in order to verify that the commitment of the flipper is valid
    /// @param coinResult The choice made by the flipper, the result of flipping the coin
    /// @param nonce A 32 characters random number generated off-chain. Required to verify that the flipper's commitment is valid
    function revealResult(bool coinResult, uint256 nonce) public {
        require(playerMadeChoice);
        require(keccak256(coinResult, nonce) == flippersCommitment);

        // To be able to start a new game
        playerMadeChoice = false;
        resultRevealed = true;

        if(coinResult == playersChoice) {
            player.transfer(address(this).balance);
        } else {
            flipper.transfer(address(this).balance);
        }
    }

    /// @notice To start a new coin flip game by commiting to a result as the flipper and paying the required bet
    /// @param _player The same or a new address for the player
    /// @param _flippersCommitment The signed message of the flipper that includes the result of the coin flip. Encrypted along with a random 32 character number
    function startNewGame(address _player, bytes32 _flippersCommitment) public payable onlyFlipper {
        require(!playerMadeChoice);
        require(msg.value == bet);
        require(resultRevealed);
        require(_player != address(0));

        resultRevealed = false;
        flippersCommitment = _flippersCommitment;
        player = _player;
    }
}
