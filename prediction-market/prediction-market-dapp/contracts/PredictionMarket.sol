// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @dev Individual prediction market for binary outcomes
 */
contract PredictionMarket is ReentrancyGuard {
    // Market states
    enum MarketState { OPEN, RESOLVED, DISPUTED }
    
    // Market details
    string public question;
    uint256 public endTime;
    uint256 public resolutionTime;
    address public creator;
    address public oracle;
    IERC20 public collateralToken;
    
    // State variables
    MarketState public state;
    bool public outcome; // true = YES wins, false = NO wins
    uint256 public totalYesTokens;
    uint256 public totalNoTokens;
    uint256 public constant FEE_PERCENTAGE = 200; // 2% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // User balances
    mapping(address => uint256) public yesBalances;
    mapping(address => uint256) public noBalances;
    
    // Events
    event TokensMinted(address indexed user, uint256 amount);
    event TokensBurned(address indexed user, uint256 yesAmount, uint256 noAmount);
    event MarketResolved(bool outcome);
    event WinningsRedeemed(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }
    
    modifier marketOpen() {
        require(state == MarketState.OPEN, "Market not open");
        require(block.timestamp < endTime, "Market ended");
        _;
    }
    
    constructor(
        string memory _question,
        uint256 _endTime,
        address _oracle,
        address _collateralToken,
        address _creator
    ) {
        require(_endTime > block.timestamp, "End time must be future");
        require(_oracle != address(0), "Invalid oracle");
        require(_collateralToken != address(0), "Invalid token");
        
        question = _question;
        endTime = _endTime;
        oracle = _oracle;
        collateralToken = IERC20(_collateralToken);
        creator = _creator;
        state = MarketState.OPEN;
    }
    
    /**
     * @dev Mint YES and NO tokens by depositing collateral
     * @param amount Amount of collateral to deposit
     */
    function mintTokens(uint256 amount) external marketOpen nonReentrant {
        require(amount > 0, "Amount must be positive");
        
        // Transfer collateral from user
        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Mint equal YES and NO tokens
        yesBalances[msg.sender] += amount;
        noBalances[msg.sender] += amount;
        totalYesTokens += amount;
        totalNoTokens += amount;
        
        emit TokensMinted(msg.sender, amount);
    }
    
    /**
     * @dev Burn equal YES and NO tokens to withdraw collateral
     * @param amount Amount of tokens to burn
     */
    function burnTokens(uint256 amount) external marketOpen nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(yesBalances[msg.sender] >= amount, "Insufficient YES tokens");
        require(noBalances[msg.sender] >= amount, "Insufficient NO tokens");
        
        // Burn tokens
        yesBalances[msg.sender] -= amount;
        noBalances[msg.sender] -= amount;
        totalYesTokens -= amount;
        totalNoTokens -= amount;
        
        // Return collateral
        require(
            collateralToken.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit TokensBurned(msg.sender, amount, amount);
    }
    
    /**
     * @dev Resolve the market with an outcome
     * @param _outcome true for YES, false for NO
     */
    function resolveMarket(bool _outcome) external onlyOracle {
        require(block.timestamp >= endTime, "Market not ended");
        require(state == MarketState.OPEN, "Already resolved");
        
        outcome = _outcome;
        state = MarketState.RESOLVED;
        resolutionTime = block.timestamp;
        
        emit MarketResolved(_outcome);
    }
    
    /**
     * @dev Redeem winning tokens for collateral
     */
    function redeemWinnings() external nonReentrant {
        require(state == MarketState.RESOLVED, "Market not resolved");
        
        uint256 winningBalance;
        
        if (outcome) {
            winningBalance = yesBalances[msg.sender];
            require(winningBalance > 0, "No winning tokens");
            yesBalances[msg.sender] = 0;
        } else {
            winningBalance = noBalances[msg.sender];
            require(winningBalance > 0, "No winning tokens");
            noBalances[msg.sender] = 0;
        }
        
        // Calculate payout with fee
        uint256 fee = (winningBalance * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 payout = winningBalance - fee;
        
        // Transfer winnings
        require(
            collateralToken.transfer(msg.sender, payout),
            "Transfer failed"
        );
        
        // Transfer fee to creator
        if (fee > 0) {
            require(
                collateralToken.transfer(creator, fee),
                "Fee transfer failed"
            );
        }
        
        emit WinningsRedeemed(msg.sender, payout);
    }
    
    /**
     * @dev Emergency withdraw for unresolved markets after long period
     */
    function emergencyWithdraw() external nonReentrant {
        require(
            block.timestamp > endTime + 30 days,
            "Emergency period not reached"
        );
        require(state == MarketState.OPEN, "Market already resolved");
        
        uint256 yesBalance = yesBalances[msg.sender];
        uint256 noBalance = noBalances[msg.sender];
        uint256 refundAmount = yesBalance < noBalance ? yesBalance : noBalance;
        
        require(refundAmount > 0, "No tokens to withdraw");
        
        // Clear balances
        yesBalances[msg.sender] -= refundAmount;
        noBalances[msg.sender] -= refundAmount;
        totalYesTokens -= refundAmount;
        totalNoTokens -= refundAmount;
        
        // Refund collateral
        require(
            collateralToken.transfer(msg.sender, refundAmount),
            "Transfer failed"
        );
        
        emit EmergencyWithdraw(msg.sender, refundAmount);
    }
    
    /**
     * @dev Get market details
     */
    function getMarketInfo() external view returns (
        string memory,
        uint256,
        uint256,
        MarketState,
        bool,
        uint256,
        uint256
    ) {
        return (
            question,
            endTime,
            resolutionTime,
            state,
            outcome,
            totalYesTokens,
            totalNoTokens
        );
    }
}