const Iota = require('@iota/core');
const iota = Iota.composeAPI({
//provider: 'https://nodes.devnet.iota.org:443'
provider: 'https://ounnehc.website:14267'
});
const JsonReader = require('./JsonReader.js');
const jsonReader = new JsonReader();
const AgentGenerator = require('./AgentGenerator.js');
const agentGenerator = new AgentGenerator();
const PairGenerator = require('./PairGenerator.js');
const pairGenerator = new PairGenerator();
const TimeRecorder = require('./TimeRecorder.js');
const timeRecorder = new TimeRecorder();
const Configuration = require('./Configuration.js');
const config = new Configuration();

const fs = require('fs');

// Record the starting time
var startTime = new Date();
console.log(startTime);

SEED = 'XHYGQDKKOMESPEMCUCTUOHJSWQEFBEFEXMOP9NSGDNPBDVQRHENPDMXCRMNSNFRQQIBLDB9JR9ALGP9WL';
ADDRESS = 'XUCBUYYDTLJOFTXJTQVFT9XETZQNIZECJHGUKVRDWARTSUPCLINYFERIRZKAXKCJOYQPOJLSBCA9IRIGYXTRSINTVW';

const main = async () => {

   var n;
   for (n = 0; n < 1000; n ++) {
   // Loops through all the transaction pairs
   try{
      // Construct transaction bundle
      const transfers = [
      {
         value: 0,
         address: ADDRESS,
      }
      ]
      var temp_hash;
      // Convert the bundle into trytes
      const trytes = await iota.prepareTransfers(SEED, transfers).catch(error => {
          console.log('Error Preparing Transfers', error);
      })
      // Send the trytes to the node
      const response = await iota.sendTrytes(trytes, 3, 14).catch(error => {
          console.log('Error Sending Trytes', error);
      })
      // Return the hash of the sent transaction budnle,
      // which could be used to check its confirmation status
      response.map(tx => (temp_hash = tx.hash));
      console.log(temp_hash);
      console.log('Completed');
      // Record the time the transaction is attached to the ledger,
      // which could be used to calculate the confirmation time
      var timeAttached = new Date();

      } catch (e) {
         console.log('Error Sending', e);;
      }
    }

}

main();
