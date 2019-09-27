const AgentGenerator = require('./AgentGenerator.js');
const TimeRecorder = require('./TimeRecorder.js');
const JsonReader = require('./JsonReader.js');
const fs = require('fs');

const Configuration = require('./Configuration.js');
const config = new Configuration();

const agentGenerator = new AgentGenerator();
const timeRecorder = new TimeRecorder();
const jsonReader = new JsonReader();

class PairGenerator{

   constructor(){
     this.tradingPairs = new Map();
     this.tradingPairsAmount = new Map();
   }

   generateAgents(){
      agentGenerator.generateSellers(config.NUM_OF_SELLERS);
      agentGenerator.generateBuyers(config.NUM_OF_BUYERS);
   }

   readAgents(){

      agentGenerator.readSellers();
      agentGenerator.readBuyers();

   }

   printSellerList(){
      agentGenerator.printSellerList(agentGenerator.sellerList.length);
   }

   printBuyerList(){
      agentGenerator.printBuyerList(agentGenerator.buyerList.length);
   }

   printPairList(){
      for (var [key, value] of this.tradingPairs.entries()) {
         console.log();
         console.log("Buyer Seed: " + key);
         console.log("Seller Address: " + value);
         console.log("Token: " + this.tradingPairsAmount.get(key));
      }
   }

   // Matching
   sellerGetScore(){
      var n;
      var t;
      // Seller Scoring
      for(n = 0; n < agentGenerator.sellerList.length; n++){
         for(t = 0; t < agentGenerator.buyerList.length; t++){
            if(this.getScore(n, t) > agentGenerator.sellerList[n].optimalSaleTargetScore){
               agentGenerator.sellerList[n].optimalSaleTargetScore = this.getScore(n, t);
               agentGenerator.sellerList[n].optimalSaleTarget = t;
            }
         }
      }
   }

   sellerSendRequest(){
      var n;
      var t;
      // Sending Request to Buyer
      for(t = 0; t < agentGenerator.buyerList.length; t++){
         for(n = 0; n < agentGenerator.sellerList.length; n++){
            if(agentGenerator.sellerList[n].optimalSaleTarget == t){
               agentGenerator.buyerList[t].availablePurchaseTargetList.push(n);
            }
         }
      }
   }

   buyerGetScore(){
      var n;
      var t;
      // Buyer Scoring and Selecting
      for(t = 0; t < agentGenerator.buyerList.length; t++){
         if(agentGenerator.buyerList[t].availablePurchaseTargetList.length == 1){
            this.addToPairList(t, agentGenerator.buyerList[t].availablePurchaseTargetList[0], this.getCharge(t, agentGenerator.buyerList[t].availablePurchaseTargetList[0]));
            agentGenerator.sellerList[agentGenerator.buyerList[t].availablePurchaseTargetList[0]].amountGenerated = agentGenerator.sellerList[agentGenerator.buyerList[t].availablePurchaseTargetList[0]].amountGenerated - agentGenerator.buyerList[t].amountDemanded;
            agentGenerator.buyerList.splice(t, 1);
         }
         else if(agentGenerator.buyerList[t].availablePurchaseTargetList.length > 1){
            for(n = 0; n < agentGenerator.buyerList[t].availablePurchaseTargetList.length; n++){
               if(this.getScore(agentGenerator.buyerList[t].availablePurchaseTargetList[n], t) > agentGenerator.buyerList[t].optimalPurchaseTargetScore){
                  agentGenerator.buyerList[t].optimalPurchaseTargetScore = this.getScore(agentGenerator.buyerList[t].availablePurchaseTargetList[n], t);
                  agentGenerator.buyerList[t].optimalPurchaseTarget = agentGenerator.buyerList[t].availablePurchaseTargetList[n];
               }
            }
            this.addToPairList(t, agentGenerator.buyerList[t].optimalPurchaseTarget, this.getCharge(t, agentGenerator.buyerList[t].optimalPurchaseTarget));
            agentGenerator.sellerList[agentGenerator.buyerList[t].optimalPurchaseTarget].amountGenerated = agentGenerator.sellerList[agentGenerator.buyerList[t].optimalPurchaseTarget].amountGenerated - agentGenerator.buyerList[t].amountDemanded;
            agentGenerator.buyerList.splice(t, 1);
         }
      }
   }

   resetRequest(){
      var n;
      var t;
      // Reseting
      for(n = 0; n < agentGenerator.sellerList.length; n++){
         agentGenerator.sellerList[n].optimalSaleTarget = -100;
         agentGenerator.sellerList[n].optimalSaleTargetScore = -100;
      }
      for(t = 0; t < agentGenerator.buyerList.length; t++){
         agentGenerator.buyerList[t].optimalPurchaseTarget = -100;
         agentGenerator.buyerList[t].optimalPurchaseTargetScore = -100;
         agentGenerator.buyerList[t].availablePurchaseTargetList = [];
      }
   }

   getTradingPairs(){
      console.log('matching begins.');
      timeRecorder.start();
      while(this.getMaxGeneratedAmount() > this.getMinDemandedAmount() && agentGenerator.buyerList.length > 0){
         this.sellerGetScore();
         this.sellerSendRequest();
         this.buyerGetScore();
         this.resetRequest();
      }
      console.log('matching completed.');
      var seconds = timeRecorder.end();
      console.log(seconds);
      jsonReader.jsonReader('./data/transaction/group' + config.AGENTLIST_INDEX + '/transaction_data.json', (err, transaction_data) => {
         if (err) {
            console.log('Error reading file:',err)
            return
         }
         transaction_data.matching_time = seconds;
         fs.writeFile('./data/transaction/group' + config.AGENTLIST_INDEX + '/transaction_data.json', JSON.stringify(transaction_data), (err) => {
            if (err) console.log('Error writing file:', err)
         })
      })
   }

   getMaxGeneratedAmount(){
      var maxAmountGenerated = -1;
      var n = 0;
      while(n < agentGenerator.sellerList.length){
         if (agentGenerator.sellerList[n].amountGenerated > maxAmountGenerated){
            maxAmountGenerated = agentGenerator.sellerList[n].amountGenerated;
         }
         n ++;
      }
      return maxAmountGenerated;
   }

   getMinDemandedAmount(){
      var minAmountDemanded = config.MAX_DEMANDED_AMOUNT;
      var n = 0;
      while(n < agentGenerator.buyerList.length){
         if (agentGenerator.buyerList[n].amountDemanded < minAmountDemanded){
            minAmountDemanded = agentGenerator.buyerList[n].amountDemanded;
      }
         n ++;
      }
      return minAmountDemanded;
   }

   addToPairList(buyerIndex, sellerIndex, numberOfTokens){
      this.tradingPairs.set(agentGenerator.buyerList[buyerIndex].seed, agentGenerator.sellerList[sellerIndex].address);
      this.tradingPairsAmount.set(agentGenerator.buyerList[buyerIndex].seed, numberOfTokens);
   }

   // Scoring
   // Calculate score between a seller and a buyer, based on the following algorithm:
   // score = (Pb − (d × Cd)) × EP(Es), d <= Db, d <= Ds
   // score = (Pb − (d × Cd)) × ((Ds ÷ d) + EP(Es)) ÷ 2, d <= Db, d > Ds
   // score = (Pb − (d × Cd)) × ((Db ÷ d) + EP(Es)) ÷ 2, d > Db, d 􏰀<= Ds
   // score = (Pb − (d × Cd)) × ((Db ÷ d) + (Ds ÷d ) + EP(Es)) ÷ 3, d > Db, d > Ds
   getScore(sellerIndex, buyerIndex){
      var score;
      var distance = this.getDistance(agentGenerator.buyerList[buyerIndex].latitute, agentGenerator.buyerList[buyerIndex].longitute,
        agentGenerator.sellerList[sellerIndex].latitute, agentGenerator.sellerList[sellerIndex].longitute);
      var priceB = agentGenerator.buyerList[buyerIndex].pricePrefered;
      var distanceB = agentGenerator.buyerList[buyerIndex].distancePrefered;
      var distanceS = agentGenerator.sellerList[sellerIndex].distancePrefered;
      var amountDemanded = agentGenerator.buyerList[buyerIndex].amountDemanded;
      var amountGenerated = agentGenerator.sellerList[sellerIndex].amountGenerated;
      var energyTypePreferenceScore = this.getEnergyTypePreferenceScore(sellerIndex, buyerIndex);

      if(amountDemanded > amountGenerated){return -1;}
      else{
         if(distance <= distanceB && distance <= distanceS){
            score = (priceB - (distance * config.DISTANCE_CHARGE)) * energyTypePreferenceScore;
            return score;
         }
         else if(distance <= distanceB && distance > distanceS){
            score = (priceB - (distance * config.DISTANCE_CHARGE)) * ((distanceS / distance) + energyTypePreferenceScore) / 2;
            return score;
         }
         else if(distance > distanceB && distance <= distanceS){
            score = (priceB - (distance * config.DISTANCE_CHARGE)) * ((distanceB / distance) + energyTypePreferenceScore) / 2;
            return score;
         }
         else if(distance > distanceB && distance > distanceS){
            score = (priceB - (distance * config.DISTANCE_CHARGE)) * ((distanceS / distance) + (distanceB / distance) + energyTypePreferenceScore) / 3;
            return score;
         }
         else{
            return score;
         }
      }
   }

   getEnergyTypePreferenceScore(sellerIndex, buyerIndex){
      if(agentGenerator.buyerList[buyerIndex].energyTypePrefered == agentGenerator.sellerList[sellerIndex].energyType){return 1;}
      else{return 0;}
   }

   // Calculate the distance between the buyer and seller
   getDistance(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
      var dLon = this.deg2rad(lon2-lon1);
      var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return d;
   }

   deg2rad(deg) {
      return deg * (Math.PI/180)
   }

   // Print the geographical distance between a trading pair
   printDistance(buyerIndex, sellerIndex){
      console.log();
      console.log("Distance between buyer" + buyerIndex + " and seller" + sellerIndex + ": "
       + this.getDistance(agentGenerator.buyerList[buyerIndex].latitute, agentGenerator.buyerList[buyerIndex].longitute, agentGenerator.sellerList[sellerIndex].latitute, agentGenerator.sellerList[sellerIndex].longitute) + "km");
   }

   // Calculate the charge
   getCharge(buyerIndex, sellerIndex){
      var charge = config.DISTANCE_CHARGE * this.getDistance(agentGenerator.buyerList[buyerIndex].latitute, agentGenerator.buyerList[buyerIndex].longitute,
        agentGenerator.sellerList[sellerIndex].latitute, agentGenerator.sellerList[sellerIndex].longitute) * config.IOTA_TO_GBP;
      return charge.toFixed(6);
   }

}

module.exports = PairGenerator;
