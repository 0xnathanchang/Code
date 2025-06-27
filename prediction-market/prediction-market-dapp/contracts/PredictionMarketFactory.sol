// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

/**
 * @title PredictionMarketFactory
 * @dev Factory contract to create and manage prediction markets
 */
contract PredictionMarketFactory is Ownable {
    // State variables
    address[] public markets;
    mapping(address => bool) public isValidMarket;
    mapping(address => bool) public approvedOracles;
    mapping(address => bool) public approvedTokens;
    
    // Events
    event MarketCreated(
        address indexed market,
        string question,
        uint256 endTime,
        address oracle,
        address collateralToken
    );
    event OracleApproved(address oracle, bool approved);
    event TokenApproved(address token, bool approved);
    
    constructor() Ownable(msg.sender) {
        // Constructor will set msg.sender as owner
    }
    
    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory _question,
        uint256 _endTime,
        address _oracle,
        address _collateralToken
    ) external returns (address) {
        require(bytes(_question).length > 0, "Empty question");
        require(_endTime > block.timestamp + 1 hours, "End time too soon");
        require(approvedOracles[_oracle], "Oracle not approved");
        require(approvedTokens[_collateralToken], "Token not approved");
        
        // Deploy new market
        PredictionMarket market = new PredictionMarket(
            _question,
            _endTime,
            _oracle,
            _collateralToken,
            msg.sender
        );
        
        address marketAddress = address(market);
        markets.push(marketAddress);
        isValidMarket[marketAddress] = true;
        
        emit MarketCreated(
            marketAddress,
            _question,
            _endTime,
            _oracle,
            _collateralToken
        );
        
        return marketAddress;
    }
    
    /**
     * @dev Approve or revoke oracle
     */
    function setOracleApproval(address _oracle, bool _approved) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle");
        approvedOracles[_oracle] = _approved;
        emit OracleApproved(_oracle, _approved);
    }
    
    /**
     * @dev Approve or revoke collateral token
     */
    function setTokenApproval(address _token, bool _approved) external onlyOwner {
        require(_token != address(0), "Invalid token");
        approvedTokens[_token] = _approved;
        emit TokenApproved(_token, _approved);
    }
    
    /**
     * @dev Get all markets
     */
    function getMarkets() external view returns (address[] memory) {
        return markets;
    }
    
    /**
     * @dev Get number of markets
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }
    
    /**
     * @dev Get markets in range (for pagination)
     */
    function getMarketsInRange(
        uint256 _start,
        uint256 _end
    ) external view returns (address[] memory) {
        require(_start < _end, "Invalid range");
        require(_end <= markets.length, "End exceeds length");
        
        uint256 length = _end - _start;
        address[] memory result = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = markets[_start + i];
        }
        
        return result;
    }
}