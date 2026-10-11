'use strict';
const musicAudio=document.querySelector('#birthday-music');
const musicTabId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const musicOwnerKey='dima-birthday-music-owner';
let musicOwned=false,musicStarting=false,musicChannel;
try{musicChannel=new BroadcastChannel('dima-birthday-single-music');musicChannel.onmessage=event=>{if(event.data?.type==='claim'&&event.data.tab!==musicTabId)releaseMusic();};}catch{}
function updateMusic(playing){document.body.classList.toggle('music-playing',playing);document.querySelector('#sound').textContent=playing?'♫ CRAZY · на повторі':'♫ CRAZY';document.querySelector('#music-status').textContent=playing?'Твій святковий саундтрек уже грає ↻':'Музика запускається на четвертому кроці';if(playing)completeQuest('music');}
function releaseMusic(){musicOwned=false;musicAudio.pause();updateMusic(false);}
addEventListener('storage',event=>{if(event.key===musicOwnerKey&&event.newValue&&event.newValue!==musicTabId)releaseMusic();});
function claimMusic(){musicOwned=true;try{localStorage.setItem(musicOwnerKey,musicTabId);}catch{}try{musicChannel?.postMessage({type:'claim',tab:musicTabId});}catch{}}
async function startMusic(){if(musicStarting)return false;if(musicOwned&&!musicAudio.paused)return true;musicStarting=true;claimMusic();musicAudio.volume=.45;musicAudio.loop=true;try{await musicAudio.play();if(!musicOwned){musicAudio.pause();return false;}updateMusic(true);return true;}catch{musicOwned=false;updateMusic(false);return false;}finally{musicStarting=false;}}
musicAudio.addEventListener('play',()=>{if(!musicOwned){musicAudio.pause();return;}updateMusic(true);});
musicAudio.addEventListener('pause',()=>updateMusic(false));
addEventListener('pagehide',()=>{musicOwned=false;musicAudio.pause();try{if(localStorage.getItem(musicOwnerKey)===musicTabId)localStorage.removeItem(musicOwnerKey);}catch{}});
