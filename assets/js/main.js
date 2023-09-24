function o(t){let n=0;const e=c=>{n=c,t.innerHTML=`count is ${n}`};t.addEventListener("click",()=>e(n+1)),e(0)}o(document.querySelector("#counter"));
