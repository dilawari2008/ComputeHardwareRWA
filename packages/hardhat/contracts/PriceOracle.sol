// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PriceOracle {
   struct CPUMetric {
       uint256 util;
       uint256 time;
   }
   
   CPUMetric[60] private buffer;
   uint8 private index;
   uint8 private size;
   
   function addMetric(uint256 util, uint256 time) external {
       buffer[index] = CPUMetric(util, time);
       index = (index + 1) % 60;
       if (size < 60) size++;
   }
   
   function getAverageUtilization() public view returns (uint256) {
       if (size == 0) return 0;
       
       uint256 total;
       for (uint8 i = 0; i < size; i++) {
           total += buffer[i].util;
       }
       
       return total / size;
   }
   
   function getProposedRentalPrice(uint256 price) external view returns (uint256) {
       if (size == 0) return price / 2;
       
       uint256 avg = getAverageUtilization();
       return avg > 0 ? price * 2 : price / 2;
   }
}