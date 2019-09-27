"use strict";
const Window = require('window');
const window = new Window();

class IotaSeedGenerator{

   getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      if (window.crypto !== undefined) {
         var randomNum = window.crypto.getRandomValues(new Uint32Array(1))[0];
         randomNum %= max;
         randomNum -= min;
         return randomNum;
      } else {
         return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
      }
   }

   generateRandomCharacter() { //65-upercase 97-lowercase
      var randNum = this.getRandomInt(0, 26);
      return randNum < 25 ? String.fromCharCode(65 + randNum) : 9;
   }

   generateSeed() {
      var seed = "";
      for (var i = 0; i < 81; i++) {
         seed += this.generateRandomCharacter();
      }
      return seed;
   }

   displaySeed() {
      document.getElementById("heading").innerText = this.generateSeed();
   }

}

module.exports = IotaSeedGenerator;
