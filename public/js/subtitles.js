(function (window, $) {
"use strict";

var styleToElMap = { 
    italic : 'i', 
    underline : 'u',
    bold : 'b'
};

function loadTTML(progId){
    return $.get("/subtitles/" + progId)
}

function getTextValue( childNodes ){
    var returnValue = '';
    childNodes.forEach(function(node){
        switch(node.nodeType){
            case document.ELEMENT_NODE:
                if(/br/i.test(node.nodeName)){
                    returnValue += '\n';
                }
                if(/span/i.test(node.nodeName)){
                    // convert span ttml style id to el
                    var el = styleToElMap[ node.attributes.style.value ];
                    returnValue += '<'+ el +'>' + node.textContent + '</' + el + '>';
                }
                break;
            case document.TEXT_NODE:
                returnValue += node.textContent;
                break;
            default:
                console.log('unknown node type', node);
                // ATTIBUTE_NODE, CDATA_SECTION_NODE, COMMENT_NODE, etc
        }
    });
    // trim each line
    returnValue = returnValue.split('\n').map(trimText).join('\n') // trim separate lines
                    .replace(/^\n|\n$/g, '') // remove initial and ending line breaks
                    .replace(/\n{2,}/, '\n'); // remove multiple linebreaks
    
    return returnValue;
}

function complexTimeToSeconds(timeString /* hh:mm:ss.sss */){
    return timeString.split(':').map(parseFloat).reduce(function(prev, current, index) { 
        return prev + current * [3600, 60, 1][index]; 
    });
}
function extractCueDataFromTTML(ttmlDoc){
    var cues = [];
    var nodes = [].slice.call(ttmlDoc.querySelectorAll('[begin],[end]'), 0);

    nodes.forEach(function(node){
        var start = complexTimeToSeconds(node.getAttribute('begin')),
            stop = start + complexTimeToSeconds(node.getAttribute('dur')),
            value = getTextValue([].slice.call(node.childNodes, 0));

        cues.push( new VTTCue(start, stop, value) );
    });
    
    return cues;
}

function trimText(text){
    return text.trim();
}

function onCueEnter(event){
    console.log('on : ' + event.currentTarget.text + '\n');
}

window.loadSubtitles = function (progId) {
	loadTTML(progId).done(function (xdoc) {
		
	    var cues = extractCueDataFromTTML(xdoc);
	    console.log(cues);
	    
	    // create and add track element to video
	    var vid = document.querySelector('video');
	    vid.addTextTrack("subtitles", "sample");
	    
	    // add cues to text track
	    var track = vid.textTracks[0];
	    cues.forEach(function(cue){
	        // cue.onenter = onCueEnter;
	        track.addCue(cue);
	    });
	    track.mode = 'showing';
    });
}

}(window, jQuery));