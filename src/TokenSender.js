process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const Iota = require('@iota/core');
const iota = Iota.composeAPI({
provider: 'https://nodes.devnet.iota.org:443'
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

pairGenerator.readAgents();
pairGenerator.getTradingPairs();

jsonReader.jsonReader('./data/group' + config.AGENTLIST_INDEX + '/transaction_data.json', (err, transaction_data) => {
   if (err) {
      console.log('Error reading file:',err)
      return
   }

   transaction_data.number_of_transactions = pairGenerator.tradingPairs.size;

   fs.writeFile('./data/group' + config.AGENTLIST_INDEX + '/transaction_data.json', JSON.stringify(transaction_data), (err) => {
      if (err) console.log('Error writing file:', err)
   })
})

const main = async () => {

timeRecorder.start();
   for (var [key, value] of pairGenerator.tradingPairs.entries()) {

   try{
      const transfers = [
      {
         value: 0,
         address: value,
      }
      ]
      var temp_hash;
      const trytes = await iota.prepareTransfers(value, transfers);
      // Send bundle to node.
      const response = await iota.sendTrytes(trytes, 3, 9);
      response.map(tx => (temp_hash = tx.hash));
      console.log(temp_hash);
      console.log('Completed');
      jsonString = fs.readFileSync('./data/group' + config.AGENTLIST_INDEX + '/transactions.json');
      jsonString = jsonString + JSON.stringify(response);

      fs.writeFile('./data/group' + config.AGENTLIST_INDEX + '/transactions.json', jsonString, err => {
      if (err) {
         console.log('Error writing file', err)
      } else {
         console.log('Successfully wrote file')
      }
      })

function getStatus([temp_hash]){
iota.getLatestInclusion([temp_hash])
    .then(states => {
        // Check that none of the transactions have been confirmed
        if (states[0] == true) {
            // Get latest tail hash
            console.log("it is confirmed.");
            var seconds = timeRecorder.end()
            console.log(seconds);

            jsonReader.jsonReader('./data/group' + config.AGENTLIST_INDEX + '/transaction_data.json', (err, transaction_data) => {
               if (err) {
                  console.log('Error reading file:',err)
                  return
               }
               transaction_data.transaction_time = transaction_data.transaction_time + seconds;
               transaction_data.number_of_confirmed_orders = transaction_data.number_of_confirmed_orders + 1;
               fs.writeFile('./data/group' + config.AGENTLIST_INDEX + '/transaction_data.json', JSON.stringify(transaction_data), (err) => {
                  if (err) console.log('Error writing file:', err)
               })
            })

            return;
        } else {
            getStatus([temp_hash]);
        }
    }).catch(error => {
        console.log(error);
    })
}

getStatus([temp_hash]);

   } catch (e) {
      console.log(e);
   }
}

}

main();
