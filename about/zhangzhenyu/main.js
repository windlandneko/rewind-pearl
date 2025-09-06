const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

addEventListener('load', () => {
  $('.preloader').classList.add('hide-preloader')
  setTimeout(() => {
    $$('#intro .animation-container').forEach(el => {
      setTimeout(() => {
        el.classList.add('run-animation')
      }, el.dataset.animationDelay)
    })
  }, 700)
})

ScrollReveal().reveal('.scroll', {
  origin: 'right',
  distance: '20%',
})

$('#intro a').addEventListener('click', event => {
  event.preventDefault()
  const target = $(event.target.getAttribute('href'))
  scrollTo({
    top: target.getBoundingClientRect().top + scrollY - 40,
    behavior: 'smooth',
  })
})

const neko = $('.image-container > .neko')
const background = $('.image-container > .background')
const k = 0.98
let pos = [0, 0],
  target_pos = [0, 0]

document.addEventListener('mousemove', evt => {
  target_pos = [
    (evt.clientX - innerWidth / 2) / 200,
    (evt.clientY - innerHeight / 2) / 200,
  ]
})

function update3Dview() {
  const [x, y] = pos
  neko.style.transform = `translate(${x}px, ${y}px)`
  background.style.transform = `translate(${-x / 2}px, ${-y / 2}px)`
  pos[0] = k * pos[0] + (1 - k) * target_pos[0]
  pos[1] = k * pos[1] + (1 - k) * target_pos[1]
  if (Math.abs(pos[0]) < 1e-2 && Math.abs(pos[1]) < 1e-2) {
    neko.style.transform = 'translate(0px, 0px)'
    background.style.transform = 'translate(0px, 0px)'
  }
  requestAnimationFrame(update3Dview)
}
requestAnimationFrame(update3Dview)

$('#year').textContent = '一二三四五六七八九'[
  ~~((Date.now() - 17224e8) / 31536e6)
]

function onMediaQueryChange(e) {
  $('#point-arrow').textContent = e.matches ? '↑' : '←'
}
matchMedia('(max-width: 1000px)').addEventListener('change', onMediaQueryChange)
onMediaQueryChange(matchMedia('(max-width: 1000px)'))
