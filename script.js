var swiper = new Swiper('.blog-slider', {
      spaceBetween: 30,
      effect: 'fade',
      crossFade: true,
      loop: true,
      mousewheel: {
        invert: false,
      },
      // autoHeight: true,
      pagination: {
        el: '.blog-slider__pagination',
        clickable: true,
      }
    })


const slides = document.querySelector(".sample-slides");
const images = document.querySelectorAll(".sample-slides img");
const total = images.length;
let slideWidth = 500;

let index = 1; // 初始位置在真正的第一张
let autoPlayInterval;

// 初始化指示器
const dotsContainer = document.querySelector(".dots");
for (let i = 0; i < total - 2; i++) {
    let dot = document.createElement("div");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(i + 1));
    dotsContainer.appendChild(dot);
}
const dots = document.querySelectorAll(".dot");

// 设置初始位置
slides.style.transform = `translateX(${-index * slideWidth}px)`;

function updateDots() {
    dots.forEach(dot => dot.classList.remove("active"));
    try {
        dots[index - 1].classList.add("active");
    } catch (e) {
        dots[1].classList.add("active");
    }

}

function showSlide(n) {
    slides.style.transition = "transform 0.5s ease-in-out";
    index = n > total ? 1 : n;
    slides.style.transform = `translateX(${-index * slideWidth}px)`;
    slides.addEventListener("transitionend", function resetPosition() {
        if (index === total - 1) {
            slides.style.transition = "none";
            index = 1;
            slides.style.transform = `translateX(${-index * slideWidth}px)`;
        } else if (index === 0) {
            slides.style.transition = "none";
            index = total - 2;
            slides.style.transform = `translateX(${-index * slideWidth}px)`;
        }
        updateDots();
        slides.removeEventListener("transitionend", resetPosition);
    });
}

function goToSlide(n) {
    clearInterval(autoPlayInterval);
    showSlide(n);
    startAutoPlay();
}

document.querySelector(".prev").addEventListener("click", () => goToSlide(index - 1));
document.querySelector(".next").addEventListener("click", () => goToSlide(index + 1));

// 自动轮播
function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        showSlide(index + 1);
    }, 3000);
}

function updateSlideWidth() {
    if (window.innerWidth < 1150 && window.innerWidth > 768) {
        console.log(window.innerWidth)
        slideWidth = 300
    } else if (window.innerWidth < 768 && window.innerWidth > 576) {
        slideWidth = 500
    } else if (window.innerWidth < 576 && window.innerWidth > 450) {
        slideWidth = 400
    } else if (window.innerWidth < 450) {
        slideWidth = 340
    } else {
        slideWidth = 500
    }
}

updateSlideWidth()
startAutoPlay();
window.addEventListener("resize", updateSlideWidth);




let real_fans = -999
let counter = 0;
let resetTimeout;

const apiUrl = 'https://uzuki.me:7466/fans';

fetch(apiUrl, {
    method: 'GET'
})
    .then(res => res.json())
    .then(
        (result) => {
            console.log(result['fans']);
            real_fans = result['fans']
        }
    )
    .catch(error => {
        console.error('粉丝数获取失败:', error);
    });


function addFans() {
    counter++;
    const numContainer = document.getElementById('number-container');
    const numElement = document.createElement('label');

    numElement.classList.add('number');
    numElement.classList.add('numberAdd');
    numElement.innerText = real_fans + counter; // 计数器数字
    numContainer.appendChild(numElement);

    setTimeout(() => {
        numElement.classList.add('fadeAdd');
    }, 100);

    setTimeout(() => {
        numElement.remove();
    }, 1100);

    clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
        counter = -1;
    }, 5000);
}

function deductFans() {
    counter--;
    const numContainer = document.getElementById('number-container');
    const numElement = document.createElement('label');
    numElement.classList.add('number');
    numElement.classList.add('numberDeduct');
    numElement.innerText = real_fans + counter; // 计数器数字
    numContainer.appendChild(numElement);
    setTimeout(() => {
        numElement.classList.add('fadeDeduct');
    }, 100);

    setTimeout(() => {
        numElement.remove();
    }, 1100);

    clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
        counter = -1;
    }, 5000);
}
