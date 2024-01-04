
let sport_title = document.querySelector("#sport_title");

function easy_background(selector, sld_args) {

  //to load images for uninterrupted slideshow
  var p = document.querySelector("#img_loader")
  sld_args.slide.forEach(function (v, i) {
    p.innerHTML += (v ? "<img src='" + v + "'>" : "");
  });
  p.style.display = "none";


  setTimeout(function () {
    //add various style on selector
    if (typeof sld_args.transition_timing === 'undefined') {
      sld_args.transition_timing = "ease-in";
    }
    if (typeof sld_args.transition_duration === 'undefined') {
      sld_args.transition_duration = 500;
    }
    if (typeof sld_args.title === 'undefined') {
      sld_args.title = ["Cricket"];
    }
  }, 100);

  var delay_tally = 0;

  function slider() {
    //switching all images one by one
    sld_args.slide.forEach(function (vvv, iii) {
      setTimeout(function () {

        sport_title.style.transitionDuration = (sld_args.transition_duration / 2000) + 's'
        sport_title.classList.add("fadeout")
        const prevTitle = sport_title.innerText;

        sport_title.style.display = 'inline';
        sport_title.innerText = sld_args.title[iii];
        const widthTo = sport_title.offsetWidth;
        sport_title.style.display = 'inline-block';
        sport_title.innerText = prevTitle;
        sport_title.style.width = widthTo + 'px';

        setTimeout(async () => {
          sport_title.classList.remove("fadeout");
          sport_title.innerText = sld_args.title[iii]
        }, sld_args.transition_duration);

        document.querySelector(selector).style.backgroundImage = "url('" + vvv + "')";

      }, delay_tally); // >1

      delay_tally = delay_tally + sld_args.delay[iii];

    });

  };

  slider();

  setInterval(function () { // REPEAT
    slider();
  }, sld_args.delay.length);

}

easy_background("#welcome",
  {
    slide: [
      "Default/0.jpg",
      "Default/1.jpg",
      "Default/2.jpg",
    ],
    title: ["Cricket", "Football", "Volleyball"],
    delay: [3500, 3500, 3500]
  }
);


// mini gallery add images
function add_to_showcase(query, link_arr) {
  if (!link_arr.length)
    return

  const wrapper = document.querySelector(query)
  const showcase = wrapper.querySelector(".showcase")
  link_arr.forEach((val) => {
    const img = document.createElement("img")
    img.src = val.source
    showcase.append(img)
  });
  wrapper.querySelector(".main_pic").src = link_arr[0].source

}

// Mini Gallery
var transition_event
var el = document.createElement('fakeelement');
var transitions = {
  'transition': 'transitionend',
  'OTransition': 'oTransitionEnd',
  'MozTransition': 'transitionend',
  'WebkitTransition': 'webkitTransitionEnd'
}

for (var t in transitions)
  if (el.style[t] !== undefined) {
    transition_event = transitions[t]
    break;
  }


const fullscreen_viewer = document.querySelector("#fullscreen_viewer")
const show_image = fullscreen_viewer.querySelector("img")
fullscreen_viewer.onclick = () => show_img_fullscreen(null, false)


// TICKER
function isOverflown(element) {
  return element.scrollWidth > element.clientWidth;
}
const ticker = document.querySelector(".ticker-transition")
const ticker_holder = ticker.querySelector(".ticker-holder")
const ticker_duplicate = ticker.querySelector(".ticker-duplicate")

function update_ticker() {
  ticker_duplicate.style.display = "none"

  if (isOverflown(document.querySelector(".ticker-container"))) {
    ticker.style.animationName = "ticker"
    ticker_duplicate.style.display = "inline"
    ticker.style.transform = "none"
    ticker.style.left = "auto"
  }
  else {
    ticker.style.animationName = "none"
    ticker_duplicate.style.display = "none"
    ticker.style.transform = "translate(-50%,0)"
    ticker.style.left = "50%"
  }
}

function add_ticker_items(ticker_arr) {

  if (ticker_arr.length)
    ticker_arr.forEach((val) => {
      const ticker_item = document.createElement("div")
      ticker_item.classList.add("ticker-item")
      ticker_item.innerText = val
      ticker_holder.append(ticker_item)
      ticker_duplicate.append(ticker_item.cloneNode(true))
    })
  else
    document.querySelector('.ticker-container').style.display = "none"

  update_ticker()
}

window.onresize = update_ticker

// Latest page

var latest_index = 0
var latest_show = document.querySelector("#latest .images")
const latest_images = document.querySelector("#latest .images")

function move_latest(by) {
  let curr_index = parseInt(latest_images.scrollLeft / latest_images.offsetWidth)
  if (curr_index + by < 0)
    return
  else if (curr_index + by >= latest_show.children.length)
    return

  curr_index += by

  latest_show.scrollTo({
    top: 0,
    left: latest_show.offsetWidth * curr_index,
    behavior: 'smooth'
  });
}

function add_latest_images(latest_arr) {

  const indicators = document.querySelector("#latest_indicators")

  if (latest_arr.length) {

    latest.classList.add("latest_popup")

    document.querySelector("#latest").addEventListener("click", () => {
      document.querySelector(".latest_popup").classList.remove("latest_popup")
    }, { once: true })

    latest_arr.forEach((val, index) => {
      let img = document.createElement("img")
      img.src = val.source
      img.onclick = () => show_img_fullscreen(img, true)
      latest_images.append(img)

      let indi = document.createElement("div")
      indi.classList.add("indicator")
      indicators.append(indi)
    })

    indicators.children[0].classList.add("active_indicator")
    latest_images.onscroll = () => {

      document.querySelector(".active_indicator").classList.remove("active_indicator")
      indicators.children[
        parseInt(latest_images.scrollLeft / latest_images.offsetWidth)
      ].classList.add("active_indicator")
    }

    document.querySelector("#latest .next_btn").onclick = (e) => { if (e.stopPropagation) e.stopPropagation(); e.cancelBubble = true; move_latest(1) }
    document.querySelector("#latest .prev_btn").onclick = (e) => { if (e.stopPropagation) e.stopPropagation(); e.cancelBubble = true; move_latest(-1) }
  }
  else
    latest_images.classList.add("no-updates")


}




// FULLSCREEN
window.addEventListener("popstate", () => {
  show_img_fullscreen(null, false, true)
});

// let fullscreen_ongoing=false
let count = 0
let is_fullscreen = false
function show_img_fullscreen(img, to_show = true, back_btn = false) {
  // if(fullscreen_ongoing)
  //   return

  fullscreen_ongoing = true

  if (to_show) {
    if (img)
      show_image.src = img.src


    document.body.style.top = "-" + document.documentElement.scrollTop + "px"
    document.body.classList.add("body-no-scroll")

    // fullscreen_viewer.style.pointerEvents=""
    // fullscreen_viewer.style.opacity=1
    // fullscreen_viewer.style.pointerEvents='auto'

    if (!is_fullscreen)
      history.pushState({ id: 1 }, null)
    // count+=1
    // }

    is_fullscreen = true
  }
  else {

    document.body.classList.remove("body-no-scroll")
    // fullscreen_viewer.style.opacity=0
    // fullscreen_viewer.style.pointerEvents='none'

    if (is_fullscreen && !back_btn)
      history.go(-1)

    is_fullscreen = false
  }
}

fullscreen_viewer.addEventListener(transition_event, () => {
  fullscreen_ongoing = false
  let viewportmeta = document.querySelector('meta[name="viewport"]');
  viewportmeta.setAttribute('content', "initial-scale=1.0");
});


// Insert data
fetch('/data.json').then(r => r.json()).then(data => {
  add_ticker_items(data['notification_list'])
  add_latest_images(data['latest_images'])
  add_to_showcase("#turf", data['turf_images'])
  add_to_showcase("#lawn", data['lawn_images'])


  document.querySelectorAll(".info_wrapper").forEach((el) => {

    const showcase = el.querySelector(".showcase")
    showcase.style.display = "block"

    const fade_pic = el.querySelector(".fade_pic")
    const main_pic = el.querySelector(".main_pic")

    let ongoing = false
    var index = 0

    var curr_pic = main_pic
    var other_pic = fade_pic

    const move_img = (by, to = false) => {
      if (ongoing)
        return

      if (!to) {
        if (index + by < 0)
          return
        else if (index + by >= showcase.children.length)
          return
      }

      ongoing = true
      if (to)
        index = by
      else
        index += by

      other_pic.src = showcase.children[index].src ? showcase.children[index].src : ""
      other_pic.style.opacity = 1
      curr_pic.style.opacity = 0

      const img = showcase.querySelector("img")

      if (!img)
        return

      const style = img.currentStyle || window.getComputedStyle(img);

      showcase.scrollTo({
        top: 0,
        left: (parseInt(style.width) + parseInt(style.marginLeft) + parseInt(style.marginRight)) * (index - 1),
        behavior: "smooth",
      });

    }


    main_pic.onclick = () => show_img_fullscreen(main_pic)
    fade_pic.onclick = () => show_img_fullscreen(fade_pic)

    main_pic.addEventListener(transition_event, () => {
      other_pic.style.zIndex = 1
      curr_pic.style.zIndex = 0

      var temp = curr_pic
      curr_pic = other_pic
      other_pic = temp

      ongoing = false
    });

    el.querySelector(".next_btn").onclick = () => move_img(1)
    el.querySelector(".prev_btn").onclick = () => move_img(-1)

    Array.from(showcase.children).forEach((child, indx) => {

      if (child.nodeName.toLowerCase() !== 'img')
        return

      child.onclick = () => { move_img(indx, true) }
    });
  });
});