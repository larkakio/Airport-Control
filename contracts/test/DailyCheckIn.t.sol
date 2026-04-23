// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn public c;
    address alice = address(0xA11CE);

    function setUp() public {
        c = new DailyCheckIn();
    }

    function test_RevertWhenSendingEth() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(DailyCheckIn.ValueNotAllowed.selector);
        vm.prank(alice);
        c.checkIn{value: 1 wei}();
    }

    function test_CheckInOnce() public {
        vm.warp(1700000000);
        uint256 day = block.timestamp / 1 days;

        vm.prank(alice);
        c.checkIn();

        assertEq(c.lastCheckDay(alice), day);
        assertEq(c.streak(alice), 1);
    }

    function test_RevertSameDay() public {
        vm.warp(1700000000);
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_StreakConsecutiveDays() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        vm.warp(1_700_000_000 + 1 days);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 2);
    }

    function test_StreakResetsAfterGap() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        vm.warp(1_700_000_000 + 3 days);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);
    }
}
