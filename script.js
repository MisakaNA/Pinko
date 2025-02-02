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


/*
const apiUrl = 'https://api.bilibili.com/x/relation/stat?vmid=7785531&;jsonp=jsonp';

function fetchNumber() {
    fetch(apiUrl, {
        mode: 'no-cors'
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('fans').textContent = '当前粉丝数：' + data.data['follower'];
        })
        .catch(error => {
            document.getElementById('fans').textContent = '“画小孩的概念神”';
            console.error('粉丝数获取失败:', error);
        });
}
window.onload = fetchNumber;
*/
