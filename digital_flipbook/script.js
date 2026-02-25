let totalPages = 0;

// Open DB
let request = indexedDB.open("FlipbookDB", 1);

request.onsuccess = e => {
  let db = e.target.result;
  let tx = db.transaction("pages", "readonly");
  let store = tx.objectStore("pages");

  store.openCursor().onsuccess = e => {
    let cursor = e.target.result;

    if (cursor) {
      addPage(cursor.value);
      cursor.continue();
    } else {
      if (totalPages === 0) {
        alert("No pages found. Upload first.");
      } else {
        initFlipbook();
      }
    }
  };
};

function addPage(src) {
  totalPages++;
  $("#flipbook").append(`<div class="page"><img src="${src}"></div>`);
  $("#thumbnails").append(
    `<img src="${src}" onclick="goToPage(${totalPages})">`
  );
}



function initFlipbook() {

  $("#flipbook").turn({
    width: 900,
    height: 550,
    autoCenter: true,
    display: "double",
    gradients: true,
    acceleration: true,
    elevation: 50,
    duration:1000,
    when: {
    turned: function (e, page) {
      $("#pageNumber").text("Page " + page + " of " + totalPages);
    }
  }
  });


  $("#flipbook").mousemove(function(e) {

  const offset = $(this).offset();
  const x = e.pageX - offset.left;
  const y = e.pageY - offset.top;

  const width = $(this).width();
  const height = $(this).height();
  const edgeSize = 500; // increase area

  // RIGHT SIDE (full height)
  if (x > width - edgeSize)
    $(this).turn("peel", "r");

  // LEFT SIDE (full height)
  else if (x < edgeSize)
    $(this).turn("peel", "l");

  // TOP SIDE
  else if (y < edgeSize)
    $(this).turn("peel", "tl");

  // BOTTOM SIDE
  else if (y > height - edgeSize)
    $(this).turn("peel", "bl");

  else
    $(this).turn("peel", false);
});
}




$("#flipbook").on("click", ".page", function(e) {
  let page = $("#flipbook").turn("page");

  if (e.pageX < $(this).offset().left + $(this).width() / 2) {
    $("#flipbook").turn("previous");
  } else {
    $("#flipbook").turn("next");
  }
});

function nextPage(){ $("#flipbook").turn("next"); }
function prevPage(){ $("#flipbook").turn("previous"); }
function goToPage(p){ $("#flipbook").turn("page", p); }
let zoomLevel = 1;

function zoom() {
  zoomLevel += 0.1;
  $("#flipbook").css("transform", `scale(${zoomLevel})`);
  $("#flipbook").css("transform-origin", "center center");
}


function resetZoom() {
  zoomLevel = 1;
  $("#flipbook").css("transform", "scale(1)");
}


function fullscreen() {
  const elem = document.getElementById("flipbook");

  if (!document.fullscreenElement) {
    elem.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}