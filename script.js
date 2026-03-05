
document.addEventListener("DOMContentLoaded",()=>{

const sections=document.querySelectorAll(".slide-section")
const sideNav=document.getElementById("sideNav")

sections.forEach((section,index)=>{

const dot=document.createElement("div")
dot.classList.add("side-nav-dot")

if(index===0){
dot.classList.add("active")
}

dot.setAttribute("data-title",section.dataset.title)

dot.onclick=()=>{
section.scrollIntoView({behavior:"smooth"})
}

sideNav.appendChild(dot)

})

})
