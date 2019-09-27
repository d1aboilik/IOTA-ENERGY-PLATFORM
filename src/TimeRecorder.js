var startTime, endTime;

class TimeRecorder{

   start() {
      startTime = new Date();
   };

   end() {
      endTime = new Date();
      var timeDiff = endTime - startTime; //in ms
      // get seconds
      var seconds = Math.round((timeDiff*1000)/1000)/1000;
      return seconds;
   }

}

module.exports = TimeRecorder;
