const r=(t,o)=>Math.random()*(o-t)+t,c=(t,o)=>{let l=0,e=0,n=[];for(console.log(r(0,.07));l<=o;){const i=t*Math.cos(e*(Math.PI/180)),s=t*Math.sin(e*(Math.PI/180));n.push([i,s]),l=n.length,e+=Math.ceil(Math.random()*5),t+=r(-3,3)}return n};function d(t,o=200,l=200){const e=t.getContext("2d"),n=Math.max(window.devicePixelRatio,2);if(t.style.width=o+"px",t.style.height=l+"px",t.width=Math.floor(o*n),t.height=Math.floor(l*n),e){e.clearRect(0,0,t.width,t.height),e.scale(n,n);const i=c(50,1500);e.translate(o/2,l/2),e.beginPath(),i.forEach(s=>{e.strokeStyle="#0B0C0C",e.lineTo(s[0],s[1])}),e.stroke()}}const a=document.querySelector(".squiggle"),h=document.getElementById("squiggle");window.addEventListener("load",()=>{const t=parseInt(window.getComputedStyle(h).getPropertyValue("width")),o=parseInt(window.getComputedStyle(h).getPropertyValue("height"));a.classList.remove("squiggle--hidden"),d(h,t,o)});