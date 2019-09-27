const Agent = require('./Agent.js');
const TimeRecorder = require('./TimeRecorder.js');
const JsonReader = require('./JsonReader.js');
const fs = require('fs');

const Configuration = require('./Configuration.js');
const config = new Configuration();

const timeRecorder = new TimeRecorder();
const jsonReader = new JsonReader();

class AgentGenerator{

   constructor(){
      this.sellerList = [];
      this.buyerList = [];
   }

   // Generate simulated seller agents with random trading preference and save to json file
   generateSellers(numberOfSellers){
      console.log('Seller generation starts.');
      timeRecorder.start();
      var n = 0;
      while(n < numberOfSellers){
         const a = new Agent(n);
         a.generateRandomLatitute(config.MIN_LATITUTE, config.MAX_LATITUTE);
         a.generateRandomLongitute(config.MIN_LONGITUTE, config.MAX_LONGITUTE);
         a.generateRandomAmountGenerated(config.MIN_GENERATED_AMOUNT, config.MAX_GENERATED_AMOUNT);
         a.generateRandomPricePreference(config.MIN_PREFERED_PRICE, config.MAX_PREFERED_PRICE);
         a.generateRandomDistancePreference(config.MIN_PREFERED_DISTANCE, config.MAX_PREFERED_DISTANCE);
         a.generateRandomEnergyType(config.NUM_OF_ENERGY_TYPE);
         this.sellerList.push(a);
         console.log(n + "/" + numberOfSellers);
         n ++;
      }
      console.log('Seller generation completed.');
      var seconds = timeRecorder.end();
      console.log('this process takes ' + seconds + ' seconds.');

      this.printSellerList(numberOfSellers);

      fs.writeFile('./data/agentList/sellerList/sellerList' + config.AGENTLIST_INDEX + '.json', JSON.stringify(this.sellerList), (err) => {
         if (err) console.log('Error writing file:', err)
      })

   }

   // Generate simulated buyer agents with random trading preference and save to jason file
   generateBuyers(numberOfBuyers){
      console.log('Buyer generation starts.');
      timeRecorder.start();
      var n = 0;
      while(n < numberOfBuyers){
         const a = new Agent(n);
         a.generateRandomLatitute(config.MIN_LATITUTE, config.MAX_LATITUTE);
         a.generateRandomLongitute(config.MIN_LONGITUTE, config.MAX_LONGITUTE);
         a.generateRandomAmountDemanded(config.MIN_DEMANDED_AMOUNT, config.MAX_DEMANDED_AMOUNT);
         a.generateRandomPricePreference(config.MIN_PREFERED_PRICE, config.MAX_PREFERED_PRICE);
         a.generateRandomDistancePreference(config.MIN_PREFERED_DISTANCE, config.MAX_PREFERED_DISTANCE);
         a.generateRandomEnergyTypePreference(config.NUM_OF_ENERGY_TYPE);
         this.buyerList.push(a);
         console.log(n + "/" + numberOfBuyers);
         n ++;
      }
      console.log('Buyer generation completed.');
      var seconds = timeRecorder.end();
      console.log('this process takes ' + seconds + ' seconds.');

      this.printBuyerList(numberOfBuyers);

      fs.writeFile('./data/agentList/buyerList/buyerList' + config.AGENTLIST_INDEX + '.json', JSON.stringify(this.buyerList), (err) => {
         if (err) console.log('Error writing file:', err)
      })
   }

   // Read seller agents from file
   readSellers(){
      const sellerListContents = fs.readFileSync('./data/agentList/sellerList/sellerList' + config.AGENTLIST_INDEX + '.json', 'utf8');
      try{
        this.sellerList = JSON.parse(sellerListContents);
      } catch(err) {
        console.error(err);
      }

   }

   //Read buyer agents from file
   readBuyers(){

      const buyerListContents = fs.readFileSync('./data/agentList/buyerList/buyerList' + config.AGENTLIST_INDEX +'.json', 'utf8');
      try{
         this.buyerList = JSON.parse(buyerListContents);
      } catch(err) {
         console.error(err);
      }
   }

   // Print seller list for testing
   printSellerList(numberOfSellers){
      var t = 0;
      while(t < numberOfSellers){
         console.log();
         console.log('SellerIndex: ' + this.sellerList[t].index);
         console.log('Seed: ' + this.sellerList[t].seed);
         console.log('Address: ' + this.sellerList[t].address);
         console.log('Location: [' + this.sellerList[t].latitute + ',' + this.sellerList[t].longitute +']');
         console.log('Amount Generated: ' + this.sellerList[t].amountGenerated + 'kWh');
         console.log('Prefered Price: ' + this.sellerList[t].pricePrefered + 'p/kWh');
         console.log('Prefered Distance: ' + this.sellerList[t].distancePrefered + 'km');
         console.log('Energy Type: ' + this.sellerList[t].energyType);
         console.log('optimalSaleTarget: ' + this.sellerList[t].optimalSaleTarget);
         console.log('optimalSaleTargetScore: ' + this.sellerList[t].optimalSaleTargetScore);
         t ++;
      }
   }

   // Print buyer list for testing
   printBuyerList(numberOfBuyers){
      var t = 0;
      while(t < numberOfBuyers){
         console.log();
         console.log('BuyerIndex: ' + this.buyerList[t].index);
         console.log('Seed: ' + this.buyerList[t].seed);
         console.log('Location: [' + this.buyerList[t].latitute + ',' + this.buyerList[t].longitute +']');
         console.log('Amount Demanded: ' + this.buyerList[t].amountDemanded + 'kWh');
         console.log('Prefered Price: ' + this.buyerList[t].pricePrefered + 'p/kWh');
         console.log('Prefered Distance: ' + this.buyerList[t].distancePrefered + 'km');
         console.log('Prefered Energy Type: ' + this.buyerList[t].energyTypePrefered);
         console.log('optimal Purchase Target: ' + this.buyerList[t].optimalPurchaseTarget);
         console.log('optimal Purchase Target Score: ' + this.buyerList[t].optimalPurchaseTargetScore);
         console.log('available Purchase Target List: ' + this.buyerList[t].availablePurchaseTargetList.toString());
         t ++;
      }
   }

}

module.exports = AgentGenerator;
