const IotaSeedGenerator = require('./IotaSeedGenerator');
const iotaSeedGenerator = new IotaSeedGenerator();

// Require the IOTA library
const Iota = require('@iota/core');
const Converter = require('@iota/converter');

class Agent{

   constructor(agentIndex){
      this.index = agentIndex;
      this.seed = iotaSeedGenerator.generateSeed();
      this.address = Iota.generateAddress(this.seed, 0, 2);
      //buyer attributes
      this.optimalPurchaseTarget = -100;
      this.optimalPurchaseTargetScore = -100;
      this.availablePurchaseTargetList = [];
      //seller attributes
      this.optimalSaleTarget = -100;
      this.optimalSaleTargetScore = -100;
   }

   generateRandomLatitute(minLatitute, maxLatitute){
      this.latitute = (Math.random() * (maxLatitute - minLatitute) + minLatitute).toFixed(6)
   }

   generateRandomLongitute(minLongitute, maxLongitute){
      this.longitute = (Math.random() * (maxLongitute - minLongitute) + minLongitute).toFixed(6)
   }

   generateRandomAmountGenerated(minAmount, maxAmount){
      this.amountGenerated = (Math.random() * (maxAmount - minAmount) + minAmount).toFixed(0)
   }

   generateRandomAmountDemanded(minAmount, maxAmount){
      this.amountDemanded = (Math.random() * (maxAmount - minAmount) + minAmount).toFixed(0)
   }

   generateRandomPricePreference(minPrice, maxPrice){
      this.pricePrefered = (Math.random() * (maxPrice - minPrice) + minPrice).toFixed(0)
   }

   generateRandomDistancePreference(minDistance, maxDistance){
      this.distancePrefered = (Math.random() * (maxDistance - minDistance) + maxDistance).toFixed(0)
   }

   generateRandomEnergyType(numOfEnergyType){
      this.energyType = (Math.random() * (numOfEnergyType - 1)).toFixed(0)
   }

   generateRandomEnergyTypePreference(numOfEnergyType){
      this.energyTypePrefered = (Math.random() * (numOfEnergyType - 1)).toFixed(0)
   }

}

module.exports = Agent;
