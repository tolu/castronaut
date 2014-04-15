(function (defenition) {
	
	// Common JS
	if (typeof exports === "object") {
		module.exports = defenition();

	// Require JS
	} else if (typeof define === "function") {
		define(defenition);

	// <script>
	} else {
		Castronaut = defenition();
	}

})(function () {
"use strict";

/**
* global variables
*/
var RECIEVER_APP_ID = "A5C2854D";
var currentMediaSession = null;
var currentVolume = 0.5;
var progressFlag = 1;
var mediaCurrentTime = 0;
var session = null;
var autoJoinPolicy;
var media = [];

/*function defineMedia () {
	media = [
	    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
	     'title':'Big Buck Bunny',
	     'thumb':'images/bunny.jpg',
	     'metadataType':chrome.cast.media.MetadataType.GENERIC,
	    },
	    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4',
	     'title':'Elephant Dream',
	     'thumb':'images/ed.jpg',
	     'metadataType':chrome.cast.media.MetadataType.TV_SHOW,
	    },
	    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/tears_of_steel_1080p.mov',
	     'title':'Tears of Steel',
	     'thumb':'images/Tears.jpg',
	     'metadataType':chrome.cast.media.MetadataType.MOVIE,
	    },
	    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/Google%20IO%202011%2045%20Min%20Walk%20Out.mp3',
	     'title':'Google I/O 2011 Audio',
	     'thumb':'images/google-io-2011.jpg',
	     'metadataType':chrome.cast.media.MetadataType.MUSIC_TRACK,
	    },
	    {'url':'http://www.videws.com/eureka/castv2/images/San_Francisco_Fog.jpg',
	     'title':'San Francisco Fog',
	     'thumb':'images/San_Francisco_Fog.jpg',
	     'metadataType':chrome.cast.media.MetadataType.PHOTO,
	    },
	];
}*/

// methods added to api will be made public
var api = {};

/**
 * initialization
 */
function initializeCastApi() {
  appendMessage("initializeCastApi");
  // defineMedia();
 
 // Automatically connects when the session was started with 
 // the same appId and the same page origin (regardless of tab).
  autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;

  var sessionRequest = new chrome.cast.SessionRequest(RECIEVER_APP_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    sessionListener,
    receiverListener,
    autoJoinPolicy);

  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

/**
 * Call initialization
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
	setTimeout(initializeCastApi, 1000);
}

/**
 * initialization success callback
 */
function onInitSuccess() {
  appendMessage("init success");
}

/**
 * initialization error callback
 */
function onError() {
  appendMessage("error");
}

/**
 * generic success callback
 */
function onSuccess(message) {
  appendMessage("onSucess", message);
}

/**
 * callback on success for stopping app
 */
function onStopAppSuccess() {
  appendMessage('Session stopped');
  document.getElementById("casticon").src = 'images/cast_icon_idle.png'; 
}

/**
 * session listener during initialization
 */
function sessionListener(e) {
  appendMessage('New session ID:' + e.sessionId);
  session = e;
  if (session.media.length !== 0) {
    appendMessage(
        'Found ' + session.media.length + ' existing media sessions.');
    onMediaDiscovered('onRequestSessionSuccess_', session.media[0]);
  }
  /*jshint validthis:true*/
  session.addMediaListener( onMediaDiscovered.bind(this, 'addMediaListener') );
  session.addUpdateListener( sessionUpdateListener.bind(this) );
  /*jshint validthis:false*/
}

/**
 * session update listener 
 */
function sessionUpdateListener(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  message += ': ' + session.sessionId;
  appendMessage(message);
  if (!isAlive) {
    session = null;
  }
}

/**
 * receiver listener during initialization
 */
function receiverListener(e) {
  if( e === 'available' ) {
    appendMessage("receiver found");
  }
  else {
    appendMessage("receiver list empty");
  }
}

/**
 * callback on success for requestSession call  
 * @param {Object} e A non-null new session.
 */
function onRequestSessionSuccess(e) {
  appendMessage("session success: " + e.sessionId);
  session = e;
  document.getElementById("casticon").src = 'images/cast_icon_active.png'; 
}

/**
 * callback on launch error
 */
function onLaunchError() {
  appendMessage("launch error");
}

/**
 * launch app and request session
 */
api.launchApp = function () {
  appendMessage("launching app...");
  chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
};

/**
 * stop app/session
 */
api.stopApp = function () {
  appendMessage("stopping app...");
  session.stop(onStopAppSuccess, onError);
};

/**
 * load media
 * @param {string} a videoId for media
 */
api.loadMedia = function (videoId) {
  if (!session) {
    appendMessage("no session");
    return;
  }

  appendMessage( "loading..." + videoId );

  $.getJSON('/meta/'+videoId).done(function (data) {

    var mediaUrl = data.mediaUrl.split('?')[0];

    var mediaInfo = new chrome.cast.media.MediaInfo( mediaUrl, 'video/mp4');

    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.TV_SHOW;

    /*switch(currentMediaIndex) {
      case chrome.cast.media.MetadataType.GENERIC:
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
        mediaInfo.metadata.subtitle = 'By Blender Foundation';
        mediaInfo.metadata.releaseDate = '2000';
        mediaInfo.contentType = 'video/mp4';
        document.getElementById("media_control").style.display = 'block';
        break;
      case chrome.cast.media.MetadataType.TV_SHOW:
        mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.TV_SHOW;
        mediaInfo.metadata.seriesTitle = 'seriesTitle';
        mediaInfo.metadata.subtitle = 'Elephant Dream';
        mediaInfo.metadata.season = 5;
        mediaInfo.metadata.episode = 23;
        mediaInfo.metadata.originalAirDate = '2011';
        mediaInfo.contentType = 'video/mov';
        document.getElementById("media_control").style.display = 'block';
        break;
      case chrome.cast.media.MetadataType.MOVIE:
        mediaInfo.metadata = new chrome.cast.media.MovieMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MOVIE;
        mediaInfo.metadata.subtitle = 'steel steel steel';
        mediaInfo.metadata.studio = 'By Blender Foundation';
        mediaInfo.metadata.releaseDate = '2006';
        mediaInfo.contentType = 'video/mp4';
        document.getElementById("media_control").style.display = 'block';
        break;
      case chrome.cast.media.MetadataType.MUSIC_TRACK:
        mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MUSIC_TRACK;
        mediaInfo.metadata.albumName = 'Album name';
        mediaInfo.metadata.albumArtist = 'Album artist';
        mediaInfo.metadata.artist = 'Music artist';
        mediaInfo.metadata.composer = 'Composer';
        mediaInfo.metadata.trackNumber = 13;
        mediaInfo.metadata.discNumber = 2;
        mediaInfo.metadata.releaseDate = '2011';
        mediaInfo.contentType = 'audio/mp3';
        document.getElementById("media_control").style.display = 'block';
        break;
      case chrome.cast.media.MetadataType.PHOTO:
        mediaInfo.metadata = new chrome.cast.media.PhotoMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.PHOTO;
        mediaInfo.metadata.artist = 'Photo artist';
        mediaInfo.metadata.location = 'San Francisco';
        mediaInfo.metadata.longitude = 37.7833;
        mediaInfo.metadata.latitude = 122.4167;
        mediaInfo.metadata.width = 1728;
        mediaInfo.metadata.height = 1152;
        mediaInfo.metadata.creationDateTime = '1999';
        mediaInfo.contentType = 'image/jpg';
        document.getElementById("media_control").style.display = 'none';
        break;
      default:
        break;
    }*/

    mediaInfo.metadata.title = data.title;
    mediaInfo.metadata.images = [{'url': data.images.webImages[0].imageUrl }];

    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;
    request.currentTime = 0;
    session.loadMedia(request,onMediaDiscovered.bind(this, 'loadMedia'), onMediaError.bind(this));

  });

};

/**
 * callback on success for loading media
 * @param {Object} e A non-null media object
 */
function onMediaDiscovered(how, mediaSession) {
  appendMessage("new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')');
  currentMediaSession = mediaSession;
  mediaSession.addUpdateListener(onMediaStatusUpdate);
  mediaCurrentTime = currentMediaSession.currentTime;
  playpauseresume.innerHTML = 'Pause';
  document.getElementById("casticon").src = 'images/cast_icon_active.png'; 
}

/**
 * callback on media loading error
 * @param {Object} e A non-null media object
 */
function onMediaError(e) {
  appendMessage("media error");
  document.getElementById("casticon").src = 'images/cast_icon_warning.png'; 
}

/**
 * callback for media status event
 * @param {Object} e A non-null media object
 */
function onMediaStatusUpdate(isAlive) {
  if( progressFlag ) {
    document.getElementById("progress").value = parseInt(100 * currentMediaSession.currentTime / currentMediaSession.media.duration);
  }
  document.getElementById("playerstate").innerHTML = currentMediaSession.playerState;
}

/**
 * play media
 */
api.playMedia = function () {
  if( !currentMediaSession ) 
    return;

  var playpauseresume = document.getElementById("playpauseresume");
  if( playpauseresume.innerHTML == 'Play' ) {
    currentMediaSession.play(null,
      mediaCommandSuccessCallback.bind(this,"playing started for " + currentMediaSession.sessionId),
      onError);
      playpauseresume.innerHTML = 'Pause';
      //currentMediaSession.addListener(onMediaStatusUpdate);
      appendMessage("play started");
  }
  else {
    if( playpauseresume.innerHTML == 'Pause' ) {
      currentMediaSession.pause(null,
        mediaCommandSuccessCallback.bind(this,"paused " + currentMediaSession.sessionId),
        onError);
      playpauseresume.innerHTML = 'Resume';
      appendMessage("paused");
    }
    else {
      if( playpauseresume.innerHTML == 'Resume' ) {
        currentMediaSession.play(null,
          mediaCommandSuccessCallback.bind(this,"resumed " + currentMediaSession.sessionId),
          onError);
        playpauseresume.innerHTML = 'Pause';
        appendMessage("resumed");
      }
    }
  }
};

/**
 * stop media
 */
api.stopMedia = function () {
  if( !currentMediaSession ) 
    return;

  currentMediaSession.stop(null,
    mediaCommandSuccessCallback.bind(this,"stopped " + currentMediaSession.sessionId),
    onError);
  var playpauseresume = document.getElementById("playpauseresume");
  playpauseresume.innerHTML = 'Play';
  appendMessage("media stopped");
};

/**
 * set media volume
 * @param {Number} level A number for volume level
 * @param {Boolean} mute A true/false for mute/unmute 
 */
api.setMediaVolume = function (level, mute) {
  if( !currentMediaSession ) 
    return;

  var volume = new chrome.cast.Volume();
  volume.level = level;
  currentVolume = volume.level;
  volume.muted = mute;
  var request = new chrome.cast.media.VolumeRequest();
  request.volume = volume;
  currentMediaSession.setVolume(request,
    mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
    onError);
};

/**
 * set receiver volume
 * @param {Number} level A number for volume level
 * @param {Boolean} mute A true/false for mute/unmute
 */
api.setReceiverVolume = function (level, mute) {
  if( !session )
    return;

  if( !mute ) {
    session.setReceiverVolumeLevel(level,
      mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
      onError);
    currentVolume = level;
  }
  else {
    session.setReceiverMuted(true,
      mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
      onError);
  }
};

/**
 * mute media
 * @param {DOM Object} cb A checkbox element
 */
api.toggleMuteMedia = function (doMute) {
  if( doMute ) {
    document.getElementById('muteText').innerHTML = 'Unmute';
    //setMediaVolume(currentVolume, true);
    api.setReceiverVolume(currentVolume, true);
    appendMessage("media muted");
  }
  else {
    document.getElementById('muteText').innerHTML = 'Mute';
    //setMediaVolume(currentVolume, false);
    api.setReceiverVolume(currentVolume, false);
    appendMessage("media unmuted");
  }
};


/**
 * seek media position
 * @param {Number} pos A number to indicate percent
 */
api.seekMedia = function (pos) {
  console.log('Seeking ' + currentMediaSession.sessionId + ':' +
    currentMediaSession.mediaSessionId + ' to ' + pos + "%");
  progressFlag = 0;
  var request = new chrome.cast.media.SeekRequest();
  request.currentTime = pos * currentMediaSession.media.duration / 100;
  currentMediaSession.seek(request,
    onSeekSuccess.bind(this, 'media seek done'),
    onError);
};

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function onSeekSuccess(info) {
  appendMessage(info);
  setTimeout(function(){progressFlag = 1;},1500);
}

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function mediaCommandSuccessCallback(info) {
  appendMessage(info);
}


/**
 * append message to debug message window
 * @param {string} message A message string
 */
function appendMessage(message, data) {
  var dw = document.getElementById("debugmessage");
  dw.innerHTML += '\n' + JSON.stringify(message);
  
  if(data) console.log(message, data);
  else console.log(message);
}

return api;

});