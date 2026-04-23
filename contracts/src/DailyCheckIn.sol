// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. No ETH accepted — user pays L2 gas only.
contract DailyCheckIn {
    mapping(address => uint256) public lastCheckDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 indexed day, uint256 streakCount);

    error ValueNotAllowed();
    error AlreadyCheckedInToday();

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 day = block.timestamp / 1 days;
        uint256 last = lastCheckDay[msg.sender];
        if (last == day) revert AlreadyCheckedInToday();

        uint256 newStreak = 1;
        if (last != 0 && last == day - 1) {
            newStreak = streak[msg.sender] + 1;
        }

        streak[msg.sender] = newStreak;
        lastCheckDay[msg.sender] = day;

        emit CheckedIn(msg.sender, day, newStreak);
    }
}
