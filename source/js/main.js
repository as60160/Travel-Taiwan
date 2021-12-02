console.clear()

const type = {
  attraction: ["自然風景類", "體育健身類", "遊憩類", "古蹟類", "其他"],
  activity: ["年度活動", "藝文活動", "節慶活動", "其他"]
}

let allCityData = []
let allAttractionData = []
let allActivityData = []
let attractionData = []
let activityData = []
let selectedType = "all"
let selectedCity = "all"
let currentPath = "index"
let startNum = 0
let stepNum = 12
let selectedPage = 1
let totalPages = 1

const typeSelect = document.getElementById("type")
const citySelect = document.getElementById("city")
const searchBtn = document.getElementById("searchBtn")
const backToTopBtn = document.getElementById("backToTopBtn")
const cardList = document.getElementById("cardList")
const pagination = document.getElementById("pagination")

typeSelect.addEventListener("change", (e) => selectedType = e.target.value)
citySelect.addEventListener("change", (e) => selectedCity = e.target.value)
searchBtn.addEventListener("click", (e) => {
  e.preventDefault()
  searchData()
  resetPagination()
})
backToTopBtn.addEventListener("click", (e) => {
  e.preventDefault()
  topFunction()
})


init()
function init() {
  resetPagination()
  detectPath()
  getCityData()
}

// event
// 偵測所在頁面路徑
function detectPath() {
  currentPath = location.pathname
  document.querySelector("[data-path]").classList.remove("active")
  if (currentPath.includes("/index.html")) {
    changeNavClass("index")
    changeBannerPicture("index")
    renderTypes(type.attraction)
    getAttractionSpot()
    getActivityData()
    searchBtn.href = "attractions.html"
  }
  if (currentPath.includes("/attractions.html")) {
    changeNavClass("attractions")
    changeBannerPicture("attractions")
    renderTypes(type.attraction)
    getAttractionSpot()
    searchBtn.href = "attractions.html"
  } else if (currentPath.includes("/activities.html")) {
    changeNavClass("activities")
    changeBannerPicture("activities")
    renderTypes(type.activity)
    getActivityData()
    searchBtn.href = "activities.html"
  }
}

// 改變導覽列 class
function changeNavClass(path) {
  document.querySelector(`[data-path=${path}]`).classList.add("active")
}

// 改變 banner 背景圖
function changeBannerPicture(path) {
  document.querySelector("#banner").classList.add(`bg-${path}`)
}

// 搜尋資料
function searchData() {
  if (currentPath.includes("/index.html")) {
    sessionStorage.setItem("type", selectedType)
    sessionStorage.setItem("city", selectedCity)
    location.pathname = `/Travel-Taiwan/public/attractions.html`
  }
  if (currentPath.includes("/activities.html")) {
    getActivityData()
  } else {
    getAttractionSpot()
  }
}


// 回到最上方
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
}

function topFunction() {
  let d = document.documentElement
  let b = document.body
  let timer = setInterval(function () {
    d.scrollTop -= Math.ceil(d.scrollTop * 0.1) // For Chrome, Firefox, IE and Opera
    b.scrollTop -= Math.ceil(b.scrollTop * 0.1) // For Safari
    if(d.scrollTop == 0) clearInterval(timer)
  }, 20)
}


// get data
// 取得縣市名稱
function getCityData() {
  axios({
    method: "get",
    url: "assets/city-name.json",
    Headers: GetAuthorizationHeader()
  }).then(res => {
    allCityData = res.data.data
    // console.log(allCityData)
    renderCityName(allCityData)
  }).catch(err => {
    console.log("縣市", err)
  })
}

// 取得所有景點
function getAttractionSpot() {
  axios({
    method: "get",
    url: "https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot?$format=JSON",
    Headers: GetAuthorizationHeader()
  }).then(res => {
    res.data.forEach(item => {
      if (!item.Class1) return
      if (!item.Address) return
      allAttractionData.push(item)
    })
    // console.log("景點", allAttractionData)
    processingData(allAttractionData)
  }).catch(err => {
    console.log(err)
  })
}

// 取得所有活動
function getActivityData() {
  axios({
    method: "get",
    url: "https://ptx.transportdata.tw/MOTC/v2/Tourism/Activity?$format=JSON",
    Headers: GetAuthorizationHeader()
  }).then(res => {
    res.data.forEach(item => {
      if (!item.Class1 && !item.Class2) return
      if (!item.Address) return
      if (item.Name.includes("取消")) return
      allActivityData.push(item)
    })
    // console.log("活動", allActivityData)
    processingData(allActivityData)
  }).catch(err => {
    console.log(err)
  })
}


// processing data
// 將取得的資料整理後放到新陣列
function processingData(data) {
  attractionData = []
  activityData = []

  data.forEach(item => {
    const noData = "無提供資料"
    const obj = {}

    obj.id = item.ID
    obj.name = item.Name
    obj.address = item.Address
    obj.description = (!item.Description) ? noData : item.Description
    obj.ticketInfo = (!item.TicketInfo) ? noData : item.TicketInfo
    obj.phone = (!item.Phone) ? noData : item.Phone
    obj.class = item.Class1

    // picture
    if (!item.Picture.PictureUrl1) {
      obj.imgSrc = "https://fakeimg.pl/500x300/?text=No%20image"
      obj.imgDes = "無提供圖片"
    } else {
      obj.imgSrc = item.Picture.PictureUrl1
      obj.imgDes = item.Picture.PictureDescription1
    }
    
    // time
    if (data == allAttractionData) {
      if (!item.OpenTime) {
        obj.time = noData
      } else if(item.OpenTime.includes("24 hours")) {
        obj.time = "全天候開放"
      } else {
        obj.time = item.OpenTime
      }
      attractionData.push(obj)
    }

    if (data == allActivityData) {
      obj.time = (!item.StartTime) ? noData : item.StartTime.slice(0, 10)
      activityData.push(obj)
    }
  })

  if (data == allAttractionData) filterData(attractionData)
  if (data == allActivityData) filterData(activityData)
}

// 篩選處理過的資料
function filterData(data) {
  if (sessionStorage.getItem("type") && sessionStorage.getItem("city")) {
    selectedType = sessionStorage.getItem("type")
    selectedCity = sessionStorage.getItem("city")
    sessionStorage.clear()
  }
  
  let filterData = []
  if (selectedCity != "all" && selectedType != "all") {
    data.forEach(item => {
      if (item.address.includes(selectedCity) && item.class == selectedType) {
        filterData.push(item)
      }
    })
  } else if (selectedCity != "all" && selectedType == "all") {
    filterData = data.filter(item => item.address.includes(selectedCity))
  } else if (selectedCity == "all" && selectedType != "all") {
    filterData = data.filter(item => item.class == selectedType)
  } else {
    filterData = data
  }

  renderData(filterData)
}

// 擷取指定字串
function splitString(str, num) {
  return (str.length >= num)? (str.slice(0, num) + "...") : str
}



// render data
// 渲染類別
function renderTypes(typeData) {
  let str = `<option value="all">所有類別</option>`
  typeData.forEach(item => {
    str += `<option value="${item}">${item}</option>`
  })
  typeSelect.innerHTML = str
}

// 渲染縣市名稱
function renderCityName(cityData) {
  let str = `<option value="all">所有縣市</option>`
  cityData.forEach(item => {
    str += `<option value="${item.cityName}">${item.cityName}</option>`
  })
  citySelect.innerHTML = str
}

// 渲染資料
function renderData(data) {
  if (currentPath.includes("/index.html")) {
    startNum = Math.floor(Math.random() * data.length - stepNum) 
  }

  let endNum = startNum + stepNum
  let str = ""

  if (data.length == 0) {
    str += `
      <li class="text-center mb-12 mb-md-8 px-1">
        <p>抱歉，搜尋不到您想要的資料  ಥ⌣ಥ</p>
      </li>
    `
  } else {
    for (let i = startNum; i < endNum; i++){
      if (data[i] == undefined) break
      
      const name = splitString(data[i].name, 9)
      const address = splitString(data[i].address, 9)
      const time = splitString(data[i].time, 11)

      str += `
        <li class="col-3 col-lg-4 col-md-6 col-sm-12 mb-12 mb-md-8 px-1">
          <div class="card">
            <div class="card__head">
              <img class="card__img" src="${data[i].imgSrc}" alt="${data[i].imgDes}"/>
            </div>
            <div class="card__body"> 
              <h3 class="mt-6 mb-2">${name}</h3>
              <p class="mb-2">
                <img class="icon" src="img/geo.svg" alt="geo"/>
                <span class="ml-1">${address}</span>
              </p>
              <p class="mb-2">
                <img class="icon icon-sm" src="img/clock.svg" alt="clock"/>
                <span class="ml-1">${time}</span>
              </p>
            </div>
            <div class="card__footer pb-4">
              <a class="card__btn" href="#" data-modal-target=${data[i].id}>了解更多 </a>
            </div>
          </div>
        </li>
      `
    }
  }

  const city = (selectedCity == "all") ? "熱門" : selectedCity
  const category = (currentPath.includes("/attractions.html")) ? "景點" : "活動"
  cardList.innerHTML = `
    <div class="info pl-1"> 
      <h2 class="title-primary mb-4">${city}${category}</h2>
      <p>台灣的各個美景，都美不勝收。</p>
      <p class="mb-8">等你一同來發現這座寶島的奧妙！</p>
    </div>
    <ul class="d-flex flex-wrap"> ${str} </ul>
  `

  if(data.length > 0 && pagination) renderPagination(data.length)

  const openModalButtons = document.querySelectorAll("[data-modal-target]")
  openModalButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      openModal(e, data)
    })
  })
}

// 渲染分頁
function renderPagination(totalNum) {
  totalPages = Math.ceil(totalNum / stepNum)
  const maxPage = 5
  let str = `<li><a href="#" data-minus="1">&lt;</a></li>`

  if (totalPages < maxPage) {
    for (let i = 1; i <= totalPages; i++){
      str += `<li><a href="#" data-num=${i}>${i}</a></li>`
    }
  } else if (selectedPage <= (maxPage - 2)){
    for (let i = 1; i <= maxPage; i++){
      str += `<li><a href="#" data-num=${i}>${i}</a></li>`
    }
    str += `<li><a href="#" data-add="2">...</a></li>`
  } else if(selectedPage >= (totalPages - 2)){
    str += `<li><a href="#" data-minus="2">...</a></li>`
    for (let i = (selectedPage - 2); i <= totalPages; i++){
      str += `<li><a href="#" data-num=${i}>${i}</a></li>`
    }
  } else {
    str += `<li><a href="#" data-minus="2">...</a></li>`
    for (let i = (selectedPage - 2); i <= (selectedPage + 2); i++){
      str += `<li><a href="#" data-num=${i}>${i}</a></li>`
    }
    str += `<li><a href="#" data-add="2">...</a></li>`
  }

  str += `<li><a href="#" data-add="1">&gt;</a></li>`
  pagination.innerHTML = str
  document.querySelector(`[data-num='${selectedPage}']`).classList.add("active")

}

pagination.addEventListener("click", (e) => {
  console.log("點擊分頁")
  e.preventDefault()
  changeSelectedPage(e, totalPages)
})

// 改變分頁
function changeSelectedPage(e, totalPages) {
  if (e.target.nodeName != "A") return
  if (selectedPage == totalPages) return
  
  const num = Number(e.target.dataset.num)
  const addNum = Number(e.target.dataset.add)
  const minusNum = Number(e.target.dataset.minus)

  if (num) {
    selectedPage = num
  } else if (minusNum && selectedPage > 1) {
    selectedPage -= minusNum
  } else if (addNum && selectedPage < totalPages) {
    selectedPage += addNum
  }

  startNum = (selectedPage - 1) * stepNum

  if (currentPath.includes("/attractions.html")) {
    filterData(attractionData)
  } else {
    filterData(activityData)
  }
}

// 重設分頁
function resetPagination() {
  startNum = 0
  selectedPage = 1
}

// 渲染 modal
function openModal(e, data) {
  const target = e.target.dataset.modalTarget
  const id = data.findIndex(item => item.id == target)
  const currentItem = data[id]
  const modal = document.querySelector("#modal")

  modal.classList.add("active")
  modal.innerHTML = `
    <div class="modal__content col-6 col-md-10">
      <div class="modal__header">
        <a id="closeBtn" href="#" data-close-button> </a>
      </div>
      <div class="modal__body"> 
        <h2 class="mb-4">${currentItem.name}</h2>
        <p class="mb-4 d-flex align-items-center">
          <img class="icon" src="img/geo.svg" alt="">
          <span class="fs-5">${currentItem.address}</span>
        </p>
        <p class="mb-8">${currentItem.description}</p>
        <img class="mb-8" src="${currentItem.imgSrc}" alt="${currentItem.imgDes}">
      </div>
      <div class="modal__footer">
        <ul class="text-primary d-flex">
          <li>
            <img class="icon" src="img/clock.svg" alt="">
            <span>${currentItem.time}</span>
          </li>
          <li>
            <img class="icon" src="img/ticket.svg" alt="">
            <span>${currentItem.ticketInfo}</span>
          </li>
          <li>
            <img class="icon" src="img/phone.svg" alt="">
            <span>${currentItem.phone}</span>
          </li>
          <li>
            <img class="icon" src="img/list.svg" alt="">
            <span>${currentItem.class}</span>
          </li>
        </ul>
      </div>
    </div>
  `

  modal.addEventListener("click", (e) => {
    e.preventDefault()
    if (e.target.nodeName !== "A") return
    modal.classList.remove("active")
  })
}


// get authorization
function GetAuthorizationHeader() {
  var AppID = "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF";
  var AppKey = "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF";

  var GMTString = new Date().toGMTString();
  var ShaObj = new jsSHA("SHA-1", "TEXT");
  ShaObj.setHMACKey(AppKey, "TEXT");
  ShaObj.update("x-date: " + GMTString);
  var HMAC = ShaObj.getHMAC("B64");
  var Authorization =
    'hmac username="' +
    AppID +
    '", algorithm="hmac-sha1", headers="x-date", signature="' +
    HMAC +
    '"';

  return { Authorization: Authorization, "X-Date": GMTString };
}
