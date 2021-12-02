"use strict";console.clear();var type={attraction:["自然風景類","體育健身類","遊憩類","古蹟類","其他"],activity:["年度活動","藝文活動","節慶活動","其他"]},allCityData=[],allAttractionData=[],allActivityData=[],attractionData=[],activityData=[],selectedType="all",selectedCity="all",currentPath="index",startNum=0,stepNum=12,selectedPage=1,totalPages=1,typeSelect=document.getElementById("type"),citySelect=document.getElementById("city"),searchBtn=document.getElementById("searchBtn"),backToTopBtn=document.getElementById("backToTopBtn"),cardList=document.getElementById("cardList"),pagination=document.getElementById("pagination");function init(){resetPagination(),detectPath(),getCityData()}function detectPath(){currentPath=location.pathname,document.querySelector("[data-path]").classList.remove("active"),currentPath.includes("/index.html")&&(changeNavClass("index"),changeBannerPicture("index"),renderTypes(type.attraction),getAttractionSpot(),getActivityData(),searchBtn.href="attractions.html"),currentPath.includes("/attractions.html")?(changeNavClass("attractions"),changeBannerPicture("attractions"),renderTypes(type.attraction),getAttractionSpot(),searchBtn.href="attractions.html"):currentPath.includes("/activities.html")&&(changeNavClass("activities"),changeBannerPicture("activities"),renderTypes(type.activity),getActivityData(),searchBtn.href="activities.html")}function changeNavClass(t){document.querySelector("[data-path=".concat(t,"]")).classList.add("active")}function changeBannerPicture(t){document.querySelector("#banner").classList.add("bg-".concat(t))}function searchData(){currentPath.includes("/index.html")&&(sessionStorage.setItem("type",selectedType),sessionStorage.setItem("city",selectedCity),location.pathname="/Travel-Taiwan/public/attractions.html"),currentPath.includes("/activities.html")?getActivityData():getAttractionSpot()}function scrollFunction(){500<document.body.scrollTop||500<document.documentElement.scrollTop?backToTopBtn.style.display="block":backToTopBtn.style.display="none"}function topFunction(){var t=document.documentElement,e=document.body,a=setInterval(function(){t.scrollTop-=Math.ceil(.1*t.scrollTop),e.scrollTop-=Math.ceil(.1*e.scrollTop),0==t.scrollTop&&clearInterval(a)},20)}function getCityData(){axios({method:"get",url:"assets/city-name.json",Headers:GetAuthorizationHeader()}).then(function(t){renderCityName(allCityData=t.data.data)}).catch(function(t){console.log("縣市",t)})}function getAttractionSpot(){axios({method:"get",url:"https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot?$format=JSON",Headers:GetAuthorizationHeader()}).then(function(t){t.data.forEach(function(t){t.Class1&&t.Address&&allAttractionData.push(t)}),processingData(allAttractionData)}).catch(function(t){console.log(t)})}function getActivityData(){axios({method:"get",url:"https://ptx.transportdata.tw/MOTC/v2/Tourism/Activity?$format=JSON",Headers:GetAuthorizationHeader()}).then(function(t){t.data.forEach(function(t){(t.Class1||t.Class2)&&t.Address&&(t.Name.includes("取消")||allActivityData.push(t))}),processingData(allActivityData)}).catch(function(t){console.log(t)})}function processingData(n){attractionData=[],activityData=[],n.forEach(function(t){var e="無提供資料",a={};a.id=t.ID,a.name=t.Name,a.address=t.Address,a.description=t.Description?t.Description:e,a.ticketInfo=t.TicketInfo?t.TicketInfo:e,a.phone=t.Phone?t.Phone:e,a.class=t.Class1,t.Picture.PictureUrl1?(a.imgSrc=t.Picture.PictureUrl1,a.imgDes=t.Picture.PictureDescription1):(a.imgSrc="https://fakeimg.pl/500x300/?text=No%20image",a.imgDes="無提供圖片"),n==allAttractionData&&(t.OpenTime?t.OpenTime.includes("24 hours")?a.time="全天候開放":a.time=t.OpenTime:a.time=e,attractionData.push(a)),n==allActivityData&&(a.time=t.StartTime?t.StartTime.slice(0,10):e,activityData.push(a))}),n==allAttractionData&&filterData(attractionData),n==allActivityData&&filterData(activityData)}function filterData(t){sessionStorage.getItem("type")&&sessionStorage.getItem("city")&&(selectedType=sessionStorage.getItem("type"),selectedCity=sessionStorage.getItem("city"),sessionStorage.clear());var e=[];"all"!=selectedCity&&"all"!=selectedType?t.forEach(function(t){t.address.includes(selectedCity)&&t.class==selectedType&&e.push(t)}):e="all"!=selectedCity&&"all"==selectedType?t.filter(function(t){return t.address.includes(selectedCity)}):"all"==selectedCity&&"all"!=selectedType?t.filter(function(t){return t.class==selectedType}):t,renderData(e)}function splitString(t,e){return t.length>=e?t.slice(0,e)+"...":t}function renderTypes(t){var e='<option value="all">所有類別</option>';t.forEach(function(t){e+='<option value="'.concat(t,'">').concat(t,"</option>")}),typeSelect.innerHTML=e}function renderCityName(t){var e='<option value="all">所有縣市</option>';t.forEach(function(t){e+='<option value="'.concat(t.cityName,'">').concat(t.cityName,"</option>")}),citySelect.innerHTML=e}function renderData(e){currentPath.includes("/index.html")&&(startNum=Math.floor(Math.random()*e.length-stepNum));var t=startNum+stepNum,a="";if(0==e.length)a+='\n      <li class="text-center mb-12 mb-md-8 px-1">\n        <p>抱歉，搜尋不到您想要的資料  ಥ⌣ಥ</p>\n      </li>\n    ';else for(var n=startNum;n<t&&null!=e[n];n++){var c=splitString(e[n].name,9),i=splitString(e[n].address,9),s=splitString(e[n].time,11);a+='\n        <li class="col-3 col-lg-4 col-md-6 col-sm-12 mb-12 mb-md-8 px-1">\n          <div class="card">\n            <div class="card__head">\n              <img class="card__img" src="'.concat(e[n].imgSrc,'" alt="').concat(e[n].imgDes,'"/>\n            </div>\n            <div class="card__body"> \n              <h3 class="mt-6 mb-2">').concat(c,'</h3>\n              <p class="mb-2">\n                <img class="icon" src="img/geo.svg" alt="geo"/>\n                <span class="ml-1">').concat(i,'</span>\n              </p>\n              <p class="mb-2">\n                <img class="icon icon-sm" src="img/clock.svg" alt="clock"/>\n                <span class="ml-1">').concat(s,'</span>\n              </p>\n            </div>\n            <div class="card__footer pb-4">\n              <a class="card__btn" href="#" data-modal-target=').concat(e[n].id,">了解更多 </a>\n            </div>\n          </div>\n        </li>\n      ")}var l="all"==selectedCity?"熱門":selectedCity,o=currentPath.includes("/attractions.html")?"景點":"活動";cardList.innerHTML='\n    <div class="info pl-1"> \n      <h2 class="title-primary mb-4">'.concat(l).concat(o,'</h2>\n      <p>台灣的各個美景，都美不勝收。</p>\n      <p class="mb-8">等你一同來發現這座寶島的奧妙！</p>\n    </div>\n    <ul class="d-flex flex-wrap"> ').concat(a," </ul>\n  "),0<e.length&&pagination&&renderPagination(e.length),document.querySelectorAll("[data-modal-target]").forEach(function(t){t.addEventListener("click",function(t){t.preventDefault(),openModal(t,e)})})}function renderPagination(t){var e='<li><a href="#" data-minus="1">&lt;</a></li>';if((totalPages=Math.ceil(t/stepNum))<5)for(var a=1;a<=totalPages;a++)e+='<li><a href="#" data-num='.concat(a,">").concat(a,"</a></li>");else if(selectedPage<=3){for(var n=1;n<=5;n++)e+='<li><a href="#" data-num='.concat(n,">").concat(n,"</a></li>");e+='<li><a href="#" data-add="2">...</a></li>'}else if(totalPages-2<=selectedPage){e+='<li><a href="#" data-minus="2">...</a></li>';for(var c=selectedPage-2;c<=totalPages;c++)e+='<li><a href="#" data-num='.concat(c,">").concat(c,"</a></li>")}else{e+='<li><a href="#" data-minus="2">...</a></li>';for(var i=selectedPage-2;i<=selectedPage+2;i++)e+='<li><a href="#" data-num='.concat(i,">").concat(i,"</a></li>");e+='<li><a href="#" data-add="2">...</a></li>'}e+='<li><a href="#" data-add="1">&gt;</a></li>',pagination.innerHTML=e,document.querySelector("[data-num='".concat(selectedPage,"']")).classList.add("active")}function changeSelectedPage(t,e){if("A"==t.target.nodeName&&selectedPage!=e){var a=Number(t.target.dataset.num),n=Number(t.target.dataset.add),c=Number(t.target.dataset.minus);a?selectedPage=a:c&&1<selectedPage?selectedPage-=c:n&&selectedPage<e&&(selectedPage+=n),startNum=(selectedPage-1)*stepNum,currentPath.includes("/attractions.html")?filterData(attractionData):filterData(activityData)}}function resetPagination(){startNum=0,selectedPage=1}function openModal(t,e){var a=t.target.dataset.modalTarget,n=e.findIndex(function(t){return t.id==a}),c=e[n],i=document.querySelector("#modal");i.classList.add("active"),i.innerHTML='\n    <div class="modal__content col-6 col-md-10">\n      <div class="modal__header">\n        <a id="closeBtn" href="#" data-close-button> </a>\n      </div>\n      <div class="modal__body"> \n        <h2 class="mb-4">'.concat(c.name,'</h2>\n        <p class="mb-4 d-flex align-items-center">\n          <img class="icon" src="img/geo.svg" alt="">\n          <span class="fs-5">').concat(c.address,'</span>\n        </p>\n        <p class="mb-8">').concat(c.description,'</p>\n        <img class="mb-8" src="').concat(c.imgSrc,'" alt="').concat(c.imgDes,'">\n      </div>\n      <div class="modal__footer">\n        <ul class="text-primary d-flex">\n          <li>\n            <img class="icon" src="img/clock.svg" alt="">\n            <span>').concat(c.time,'</span>\n          </li>\n          <li>\n            <img class="icon" src="img/ticket.svg" alt="">\n            <span>').concat(c.ticketInfo,'</span>\n          </li>\n          <li>\n            <img class="icon" src="img/phone.svg" alt="">\n            <span>').concat(c.phone,'</span>\n          </li>\n          <li>\n            <img class="icon" src="img/list.svg" alt="">\n            <span>').concat(c.class,"</span>\n          </li>\n        </ul>\n      </div>\n    </div>\n  "),i.addEventListener("click",function(t){t.preventDefault(),"A"===t.target.nodeName&&i.classList.remove("active")})}function GetAuthorizationHeader(){var t=(new Date).toGMTString(),e=new jsSHA("SHA-1","TEXT");return e.setHMACKey("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF","TEXT"),e.update("x-date: "+t),{Authorization:'hmac username="FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", algorithm="hmac-sha1", headers="x-date", signature="'+e.getHMAC("B64")+'"',"X-Date":t}}typeSelect.addEventListener("change",function(t){return selectedType=t.target.value}),citySelect.addEventListener("change",function(t){return selectedCity=t.target.value}),searchBtn.addEventListener("click",function(t){t.preventDefault(),searchData(),resetPagination()}),backToTopBtn.addEventListener("click",function(t){t.preventDefault(),topFunction()}),init(),window.onscroll=function(){scrollFunction()},pagination.addEventListener("click",function(t){console.log("點擊分頁"),t.preventDefault(),changeSelectedPage(t,totalPages)});