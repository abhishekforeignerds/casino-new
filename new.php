<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body
{
  background: #2c5a39;
}

#poker_clock h1
{
  color: #000;
  font-family: georgia;
  font-size: 40px;
  font-style: italic;
  padding-top: 30px;
  opacity: 0.35;
  text-align: center;
  text-shadow: rgba(0, 0, 0, 1) 0px -1px 1px;
}

#poker_play_pause,
#poker_next_round
{
  left: 50%;
  position: absolute;
  text-align: center;
  top: 80px;
  width: 100px;
}

#poker_play_pause span,
#poker_next_round span
{
  color: #fff;
  display: block;
  font-family: georgia;
  font-size: 18px;
  margin-bottom: 5px;
}

#poker_play_pause a,
#poker_next_round a
{
  color: #fff;
  display: block;
  font-family: georgia;
  font-size: 40px;
  height: 80px;
  line-height: 80px;
  text-decoration: none;
  width: 80px;
}

#poker_play_pause
{
  margin-left: -350px;
}

#poker_play_pause a
{
  background: red;
  border: 10px dotted #fff;
  border-radius: 50px;
}

#poker_play_pause .play span
{
  border-color: transparent transparent transparent white;
  border-style: solid;
  border-width: 15px;
  display: block;
  height: 0px;
  left: 50%;
  margin-left: -5px;
  margin-top: -15px;
  position: relative;
  top: 50%;
  width: 0px;
}

#poker_play_pause .pause
{
  -ms-transform: rotate(90deg);
  -moz-transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  -o-transform: rotate(90deg);
	transform: rotate(90deg);
}

#poker_play_pause .pause span:before
{
  content: "=";
  font-size: 50px;
  position: relative;
  bottom: 2px;
}

#poker_next_round
{
  margin-left: 250px;
}

#poker_next_round a
{
  background: #333;
  border: 10px dotted #fff;
  border-radius: 50px;
}

h2
{
  color: #fff;
  font-family: georgia;
  font-size: 60px;
  margin-bottom: 0;
  margin-top: 120px;
  text-align: center;
  text-shadow: rgba(0, 0, 0, 1) 0px 1px 2px;
}

.clock
{
  color: #f3fc3f;
  font-family: georgia;
  font-size: 300px;
  margin-top: -80px;
  text-align: center;
  text-shadow: rgba(0, 0, 0, 1) 0px 2px 2px;
}

#poker_blinds
{
  text-align: center;
}

.blinds
{
  text-align: center;
}

.blinds span
{
  color: #f3fc3f;
  font-family: georgia;
  font-size: 120px;
  text-shadow: rgba(0, 0, 0, 1) 0px 2px 2px;
}

#poker_blinds > span
{
  color: #fff;
  display: block;
  font-family: georgia;
  font-size: 30px;
  margin-top: 10px;
  text-shadow: rgba(0, 0, 0, 1) 0px 1px 2px;
}

.settings,
.reset
{
  color: #fff;
  display: block;
  font-family: georgia;
  font-size: 30px;
  height: 40px;
  margin: 20px;
  opacity: 0.35;
  text-shadow: rgba(0, 0, 0, 1) 0px -1px 1px;
  text-decoration: none;
  -webkit-transition: opacity 0.3s ease;
  -moz-transition: opacity 0.3s ease;
  -o-transition: opacity 0.3s ease;
  transition: opacity 0.3s ease;
}

.settings:hover,
.reset:hover
{
  opacity: 1;
}

.settings
{
  float: left;
}

.reset
{
  float: right;
}

audio
{
  display: none;
}

/* clearfix */
.clearfix {
  *zoom: 1;
}

.clearfix:before,
.clearfix:after {
  display: table;
  line-height: 0;
  content: "";
}

.clearfix:after {
  clear: both;
}
        </style>
</head>
<body>
<div id="poker_clock" class="clearfix">
  <h1>~ Carey's Casino ~</h1>
  
  <div id="poker_play_pause">
    <span>Play/Pause</span>
    <a href="#" title="Play/Pause" class="play">
      <span></span>
    </a>
  </div>
  
  <div id="poker_next_round">
    <span>Next Round</span>
    <a href="#" title="Next Round">$</a>
  </div>
  
  <h2 id="round">Round 1</h2>
  <div class="clock">15:00</div>
  
  <div id="poker_blinds">
    <div class="blinds">
      <span class="small-blind">5</span>
      <span class="separator">/</span>
      <span class="big-blind">10</span>
    </div>
    <span>Blinds</span>
  </div>
  
  <a href="#" class="reset">Reset</a>
  
  <audio id="alarm" controls="controls">
  <source src="http://soundjax.com/reddo/73797%5Ealarmclock.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
</div>
<script>

var Poker = (function () {
  var round = 1,
      duration = 900,
      timer = duration,
      blinds = [{
        small: 5,
        big: 10
      }, {
        small: 10,
        big: 20
      }, {
        small: 15,
        big: 30
      }, {
        small: 20,
        big: 40
      }, {
        small: 25,
        big: 50
      }, {
        small: 50,
        big: 100
      }, {
        small: 75,
        big: 150
      }, {
        small: 100,
        big: 200
      }, {
        small: 150,
        big: 300
      }, {
        small: 200,
        big: 400
      }, {
        small: 300,
        big: 600
      }, {
        small: 400,
        big: 800
      }, {
        small: 500,
        big: 1000
      }, {
        small: 600,
        big: 1200
      }, {
        small: 800,
        big: 1600
      }, {
        small: 1000,
        big: 2000
      }],
      interval_id;
  
  return {
    isGamePaused: function () {
      return !interval_id ? true : false;
    },
    playAlarm: function () {
      $('#alarm')[0].play();
    },
    reset: function () {
      // reset timer
      this.resetTimer();
      
      this.stopClock();
      
      this.updateClock(timer);
      
      // reset play/pause button
      this.updatePlayPauseButton();
      
      // reset round
      round = 1;
      
      this.updateRound(round);
      
      // increase blinds
      this.updateBlinds(round);
    },
    resetTimer: function () {
      timer = duration;
    },
    startClock: function () {
      var that = this;
      
      interval_id = setInterval(function () {
        that.updateClock(timer);
        
        timer -= 1;
      }, 1000);
    },
    startNextRound: function () {
      // reset timer
      this.resetTimer();
      
      this.stopClock();
      
      this.updateClock(timer);
      
      // reset play/pause button
      this.updatePlayPauseButton();
      
      // increase round
      round += 1;
      
      this.updateRound(round);
      
      // increase blinds
      this.updateBlinds(round);
    },
    stopClock: function () {
      clearInterval(interval_id);
      interval_id = undefined;
    },
    updateBlinds: function (round) {
      var round_blinds = blinds[round - 1] || blinds[blinds.length];
      
      $('.small-blind').html(round_blinds.small);
      $('.big-blind').html(round_blinds.big);
    },
    updateClock: function (timer) {
      var minute = Math.floor(timer / 60),
          second = (timer % 60) + "",
          second = second.length > 1 ? second : "0" + second;
        
      $('.clock').html(minute + ":" + second);
      
      if (timer <= 0) {
        this.startNextRound();
        
        this.playAlarm();
        
        this.startClock();
        
        // update play/pause button
        this.updatePlayPauseButton();
      }
    },
    updatePlayPauseButton: function () {
      var pause_play_button = $('#poker_play_pause a');
      
      if (this.isGamePaused()) {
        pause_play_button.removeClass('pause');
        pause_play_button.addClass('play');
      } else {
        pause_play_button.removeClass('play');
        pause_play_button.addClass('pause');
      }
    },
    updateRound: function (round) {
      $('#round').html('Round' + ' ' + round);
    }
  };
}());

$('#poker_play_pause').on('click', function (event) {
  if (Poker.isGamePaused()) {
    Poker.startClock();
  } else {
    Poker.stopClock();
  }
  
  // update play/pause button
  Poker.updatePlayPauseButton();
});

$('#poker_next_round').on('click', function (event) {
  Poker.startNextRound();
});

$('body').on('keypress', function (event) {
  if (Poker.isGamePaused()) {
    Poker.startClock();
  } else {
    Poker.stopClock();
  }
  
  // update play/pause button
  Poker.updatePlayPauseButton();
});


$('.reset').on('click', function (event) {
  Poker.reset();
});
</script>
</body>
</html>