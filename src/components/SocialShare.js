class SocialShare{constructor(e,t){this.container=document.getElementById(e),this.gameData=t||{}}render(){const e=this.createTwitterButton();this.container.innerHTML="",this.container.appendChild(e)}createTwitterButton(){const e=document.createElement("a");return e.href="#",e.className="twitter-share-button",e.innerHTML="Tweet",e.addEventListener("click",this.shareOnTwitter.bind(this)),e}async shareOnTwitter(e){e.preventDefault();const t=this.generateShareText(),n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}\n\n${encodeURIComponent("https://pic.twitter.com/J2LyIkNC94")}&url=${encodeURIComponent("https://thebaseglobe.netlify.app")}`;window.open(n,"_blank","width=550,height=420")}generateShareText(){const{coinsCollected:e=0,enemiesKilled:t=0,shotsFired:n=0,lifesLost:r=0}=this.gameData;return`Base Around The Globe 🌎 \n#standwithcrypto $byegary\n\nCoins: ${e}\nGary's ByeBye'd 👋: ${t}\nShots Fired: ${n}\nDamage Taken: ${r}\n\n`}}export default SocialShare;