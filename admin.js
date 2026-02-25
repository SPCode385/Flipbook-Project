let db;
let totalToSave = 0;
let savedCount = 0;

// Open DB
const request = indexedDB.open("FlipbookDB", 2);

request.onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("pages")) {
    db.createObjectStore("pages", { autoIncrement: true });
  }
};

request.onsuccess = e => {
  db = e.target.result;
};

// Upload handler
function upload() {
  const files = document.getElementById("fileInput").files;
  const status = document.getElementById("status");

  if (!files.length) {
    alert("Select files first");
    return;
  }

  status.innerText = "Uploading...";

  // Clear old data
  const clearTx = db.transaction("pages", "readwrite");
  clearTx.objectStore("pages").clear();

  clearTx.oncomplete = () => {
    totalToSave = 0;
    savedCount = 0;

    for (let file of files) {
      if (file.type === "application/pdf") {
        handlePDF(file);
      } else {
        totalToSave++;
        savePage(URL.createObjectURL(file));
      }
    }
  };
}

// Save page
function savePage(data) {
  const tx = db.transaction("pages", "readwrite");
  const store = tx.objectStore("pages");

  store.add(data).onsuccess = () => {
    savedCount++;
    checkDone();
  };
}

// Handle PDF
function handlePDF(file) {
  const reader = new FileReader();

  reader.onload = () => {
    pdfjsLib.getDocument(reader.result).promise.then(pdf => {
      totalToSave += pdf.numPages;

      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then(page => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const viewport = page.getViewport({ scale: 1.2 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          page.render({ canvasContext: ctx, viewport }).promise.then(() => {
            const img = canvas.toDataURL("image/jpeg", 0.7);
            savePage(img);
          });
        });
      }
    });
  };

  reader.readAsArrayBuffer(file);
}

// Completion check
function checkDone() {
  if (savedCount === totalToSave) {
    document.getElementById("status").innerText =
      "Upload complete! Opening flipbook...";
    setTimeout(() => {
      window.location.href = "flipbook.html";
    }, 500);
  }
}


