// Load YouTube IFrame API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var timeUpdateInterval;

// Player size presets
const sizesPresets = {
  small: { width: 640, height: 360 },
  medium: { width: 854, height: 480 },
  large: { width: 1280, height: 720 }
};

// Extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (let pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Initialize or update player with new video
function loadVideo() {
  const url = document.getElementById('videoInput').value.trim();
  const videoId = extractVideoId(url);
  const errorElement = document.getElementById('errorMessage');

  if (!videoId) {
    errorElement.textContent = 'Invalid YouTube URL or video ID';
    return;
  }

  errorElement.textContent = '';
  const size = sizesPresets.small;

  if (player) {
    player.loadVideoById(videoId);
  } else {
    player = new YT.Player('player', {
      width: size.width,
      height: size.height,
      videoId: videoId,
      playerVars: {
        'playsinline': 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }
}

// Handle player size changes
function updatePlayerSize() {
  const sizeSelect = document.getElementById('playerSize');
  const customWidth = document.getElementById('customWidth');
  const customHeight = document.getElementById('customHeight');
  const applyButton = document.getElementById('applySize');
  const wrapper = document.getElementById('playerWrapper');

  if (sizeSelect.value === 'custom') {
    customWidth.style.display = 'inline-block';
    customHeight.style.display = 'inline-block';
    applyButton.style.display = 'inline-block';
  } else {
    customWidth.style.display = 'none';
    customHeight.style.display = 'none';
    applyButton.style.display = 'none';

    const size = sizesPresets[sizeSelect.value];
    if (player && size) {
      player.setSize(size.width, size.height);
      wrapper.style.width = size.width + 'px';
      wrapper.style.height = size.height + 'px';
    }
  }
}

function applyCustomSize() {
  const width = parseInt(document.getElementById('customWidth').value);
  const height = parseInt(document.getElementById('customHeight').value);
  const wrapper = document.getElementById('playerWrapper');

  if (width >= 200 && height >= 200 && player) {
    player.setSize(width, height);
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';
  }
}

// Start updating time when player is ready
function onPlayerReady(event) {
  updateRemainingTime();
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }
  timeUpdateInterval = setInterval(updateRemainingTime, 1000);
}

// Handle player state changes
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    clearInterval(timeUpdateInterval);
    document.getElementById('remainingTime').textContent = 'Remaining: 0:00';
  }
}

// Update remaining time display
function updateRemainingTime() {
  if (player && player.getCurrentTime && player.getDuration) {
    var currentTime = player.getCurrentTime();
    var duration = player.getDuration();
    var remainingSeconds = duration - currentTime;

    var minutes = Math.floor(remainingSeconds / 60);
    var seconds = Math.floor(remainingSeconds % 60);
    seconds = seconds < 10 ? '0' + seconds : seconds;

    document.getElementById('remainingTime').textContent =
      'Remaining: ' + minutes + ':' + seconds;
  }
}

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('loadButton').addEventListener('click', loadVideo);
  document.getElementById('videoInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      loadVideo();
    }
  });

  document.getElementById('playerSize').addEventListener('change', updatePlayerSize);
  document.getElementById('applySize').addEventListener('click', applyCustomSize);

  // Initialize size controls
  updatePlayerSize();
});