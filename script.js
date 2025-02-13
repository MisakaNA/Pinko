let qrSize = 500;


const dotSize = 2; //点大小
const normalGridSize = 2; //数据点密度
const denseGridSize = 1; // 定位点密度
const locatorRadius = 40; // 定位点区域半径
const qrDots = [];
let spreadRadius = 50; // 鼠标影响范围
let animationFrame;

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
    },
    on: {
        slideChange: function () {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            setTimeout(() => {
                const activeSlide = document.querySelector('.swiper-slide-active');
                if (!activeSlide) return;
                console.log(activeSlide)
                // 获取当前 Slide 内的 canvas
                const canvas = activeSlide.querySelector('#qrcode');
                const ctx = canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
                const img = activeSlide.querySelector('#qrImage');

                if (!canvas || !ctx || !img) {
                    return;
                }

                canvas.width = qrSize;
                canvas.height = qrSize;


                // 调用方法生成二维码点
                createDotsFromImage(canvas, ctx, img);

            }, 100)


        }
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



function createDotsFromImage(canvas, ctx, img) {
    const qrDots = [];
    ctx.drawImage(img, 0, 0, qrSize, qrSize);
    const imageData = ctx.getImageData(0, 0, qrSize, qrSize);
    const data = imageData.data;

    for (let y = 0; y < qrSize; y += normalGridSize) {
        for (let x = 0; x < qrSize; x += normalGridSize) {
            const gridSize = isLocatorArea(x, y) ? denseGridSize : normalGridSize;
            const index = (y * qrSize + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            if (b > r && b > g && b > 150) { // 识别淡蓝色像素
                qrDots.push({ x, y, origX: x, origY: y, vx: 0, vy: 0 });
            }
        }
    }
    ctx.clearRect(0, 0, qrSize, qrSize);
    updateQRDots(qrDots, ctx);
    initMouseMove(canvas, qrDots);
}

// 判断定位区域
function isLocatorArea(x, y) {
    const locators = [
        { x: 40, y: 40 },
        { x: qrSize - 40, y: 40 },
        { x: 40, y: qrSize - 40 }
    ];
    return locators.some(loc => Math.sqrt((x - loc.x) ** 2 + (y - loc.y) ** 2) < locatorRadius);
}

// 更新二维码点
function updateQRDots(qrDots, ctx) {
    qrDots.forEach(dot => {
        dot.vx += (dot.origX - dot.x) * 0.05;
        dot.vy += (dot.origY - dot.y) * 0.05;
        dot.vx *= 0.9;
        dot.vy *= 0.9;
        dot.x += dot.vx;
        dot.y += dot.vy;
    });
    drawDots(qrDots, ctx);
    animationFrame = requestAnimationFrame(() => updateQRDots(qrDots, ctx));
}


function drawDots(qrDots, ctx) {
    ctx.clearRect(0, 0, qrSize, qrSize);
    ctx.fillStyle = '#749df6'; // 蓝色点阵
    qrDots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function scatterDots(mouseX, mouseY, qrDots) {
    const spreadRadiusSq = spreadRadius * spreadRadius; // Use squared value to avoid Math.sqrt()

    for (let i = 0; i < qrDots.length; i++) {
        const dot = qrDots[i];
        const dx = dot.origX - mouseX;
        const dy = dot.origY - mouseY;
        const distSq = dx * dx + dy * dy; // Squared distance

        if (distSq < spreadRadiusSq) {
            const dist = Math.sqrt(distSq); // Calculate only when needed
            const angle = Math.atan2(dy, dx);
            const force = (spreadRadius - dist) / spreadRadius * 10;

            // Apply small randomness
            dot.vx = Math.cos(angle) * force + (Math.random() - 0.5) * 3;
            dot.vy = Math.sin(angle) * force + (Math.random() - 0.5) * 3;
        }
    }
}


function initMouseMove(canvas, qrDots) {
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        scatterDots(mouseX, mouseY, qrDots);
    });
}


function updateSlideWidth() {
    if (window.innerWidth < 1150 && window.innerWidth > 768) {
        qrSize = 300;
        slideWidth = 300;
    } else if (window.innerWidth < 768 && window.innerWidth > 576) {
        qrSize = 500;
        slideWidth = 500;
    } else if (window.innerWidth < 576 && window.innerWidth > 450) {
        qrSize = 400;
        slideWidth = 400;
    } else if (window.innerWidth < 450) {
        qrSize = 340;
        slideWidth = 340;
    } else {
        qrSize = 500;
        slideWidth = 500;
    }
}

function handleResize() {
    updateSlideWidth();

    const activeSlide = document.querySelector('.swiper-slide-active');

    if (activeSlide) {

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        setTimeout(() => {
            const canvas = activeSlide.querySelector('#qrcode');
            const img = activeSlide.querySelector('#qrImage');
            if (canvas && img) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                if (!canvas || !ctx || !img) {
                    return;
                }

                canvas.width = qrSize;
                canvas.height = qrSize;

                createDotsFromImage(canvas, ctx, img);
            }
        })
    }
}

updateSlideWidth();
startAutoPlay();


window.addEventListener("resize", handleResize);


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
