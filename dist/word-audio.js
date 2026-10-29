'use strict';
/* Stream the dictionary's British word recording directly in the tap handler. */
const WordAudio=(()=>{
 const player=document.getElementById('wholeWordAudio')||new Audio();player.preload='none';player.setAttribute('playsinline','');
 let loadTimer;
 function play(text){
  if(!sound){$('#notice').textContent='请先打开页面底部的声音。';setAudioStatus($('#notice').textContent);return;}
  stopVoice();clearTimeout(loadTimer);unlockAudio();const request=audioRequest;
  const url=WORD_RECORDINGS[String(text).trim().toLowerCase()];
  function active(){return request===audioRequest&&currentAudio===player;}
  function fail(message){if(!active())return;clearTimeout(loadTimer);player.pause();currentAudio=null;$('#notice').textContent=message;setAudioStatus(message);}
  if(!url){$('#notice').textContent='这个单词的词典发音暂未收录。';setAudioStatus($('#notice').textContent);return;}
  player.onended=()=>{if(!active())return;clearTimeout(loadTimer);currentAudio=null;$('#notice').textContent='';setAudioStatus('');};
  player.onerror=()=>fail('词典发音暂时没有加载成功，请检查网络后再点一次。');
  player.onplaying=()=>{if(active()){clearTimeout(loadTimer);setAudioStatus('♫ 正在播放完整单词 · 英音');}};
  player.onwaiting=()=>{if(active())setAudioStatus('正在加载词典发音…');};
  player.src=url;player.volume=1;player.muted=false;player.playbackRate=1;currentAudio=player;
  $('#notice').textContent='';setAudioStatus('正在加载词典发音…');
  loadTimer=setTimeout(()=>fail('词典发音加载较慢，请检查网络后再点一次。'),15000);
  // Immediate play preserves iPhone user activation; there is no synthetic fallback.
  const started=player.play();
  if(started?.catch)started.catch(e=>{if(e.name==='AbortError')return;fail(e.name==='NotAllowedError'?'请再点一次「听完整单词」启用声音。':'词典发音播放失败，请检查网络和媒体音量后再试。');});
 }
 return {play};
})();
