//-------------------------------------------------------
//parallax efekt
//-------------------------------------------------------
let para1 = document.getElementById('para1');
let para2 = document.getElementById('para2');
let para3 = document.getElementById('para3');
let para4 = document.getElementById('para4');
let para5 = document.getElementById('para5');
let para6 = document.getElementById('para6');
let map = document.getElementById('Mapa');
var value = window.scrollY;
//set style.top for each element
const parallax = [para1, para2, para3, para4, para5,para6]
parallax.forEach((obrazek) => {
    obrazek.style.width = (100 + 'vw');
});

//window resize
var h = (para1.offsetHeight);
map.style.top = (h +'px');

addEventListener("resize", (event) => {
    h = (para1.offsetHeight);
    map.style.top = ((value * -1.65 + h)+'px');

//parallax scroll
});
document.addEventListener('scroll', function () {
    console.log(para1.style.height)
    value = window.scrollY;
    para1.style.top = (value * -0.05) + 'px';
    para2.style.top = (value * -0.15) + 'px';
    para3.style.top = (value * -0.5) + 'px';
    para4.style.top = (value * -0.9) + 'px';
    para5.style.top = (value * -1.3) + 'px';
    para6.style.top = (value * -1.6) + 'px';
    h = (para1.offsetHeight);
    map.style.top = (h + value * -1.65) + 'px';
    console.log(map.style.top);
    });

//-------------------------------------------------------
//menu
//-------------------------------------------------------
function toggleMenu() {
    var menu = document.getElementById("menu");
    menu.classList.toggle("active");
}

// Zavření menu při kliknutí mimo něj
document.addEventListener("click", function(event) {
    var menu = document.getElementById("menu");
    var menuIcon = document.querySelector(".menu-icon");
    if (!menu.contains(event.target) && !menuIcon.contains(event.target)) {
        menu.classList.remove("active");
    }
});
// o nas
document.querySelectorAll('.shape').forEach(shape => {
    shape.addEventListener('click', () => {
      shape.classList.toggle('active');
    });
  });
  
