class MusicPlayer{constructor(){this.isMinimized=!1,this.playerElement=document.createElement("div"),this.buttonElement=document.createElement("button"),this.baseTrackUrl="https://futuretape.xyz/embed/search/will%20juergens",this.init()}init(){this.playerElement.id="music-player",this.playerElement.className="expanded",this.loadRandomTrack(),this.buttonElement.id="toggle-music-player",this.buttonElement.textContent="▼",this.buttonElement.addEventListener("click",(()=>this.togglePlayer())),document.body.appendChild(this.playerElement),document.body.appendChild(this.buttonElement),this.attemptAutoplay()}loadRandomTrack(){const t=Math.floor(6*Math.random())+1,e=`${this.baseTrackUrl}?start=${t}&autoplay=1`;this.playerElement.innerHTML=`\n      <iframe\n        src="${e}"\n        width="100%"\n        height="100"\n        frameBorder="0"\n        allow="autoplay; clipboard-write;"\n        loading="lazy"\n      ></iframe>\n    `}togglePlayer(){this.isMinimized=!this.isMinimized,this.playerElement.style.height=this.isMinimized?"40px":"100px",this.buttonElement.textContent=this.isMinimized?"▲":"▼"}attemptAutoplay(){const t=this.playerElement.querySelector("iframe");t&&(t.src+="")}}export default MusicPlayer;