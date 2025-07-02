// let ipStr = document.getElementById("ipStr");
// let opStr = document.getElementById("opStr");
// let ipLan = document.getElementById("ipLan");
// let opLan = document.getElementById("opLan");

// function translate() {
//   if (ipStr.value !== "") {
//     const url = "https://text-translator2.p.rapidapi.com/translate";
//     const options = {
//       method: "POST",
//       headers: {
//         "content-type": "application/x-www-form-urlencoded",
//         "X-RapidAPI-Key": "28a1aa8d66msh6d641cebad4d626p1c4f86jsn6d655bf181a3",
//         "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
//       },
//       body: new URLSearchParams({
//         source_language: ipLan.value,
//         target_language: opLan.value,
//         text: ipStr.value,
//       }),
//     };

//     fetch(url, options)
//       .then((res) => res.json())
//       .then((data) => {
//         try {
//           opStr.value = data.data.translatedText;
//         } catch {
//           opStr.placeholder = data.message;
//         }
//       })
//       .catch((err) => console.error(err));
//   } else {
//     alert("Input can't be empty");
//   }
// }

// function ajaxFun(str) {
//   if (str === "") {
//     opStr.value = "";
//     return;
//   }
//   translate();
// }

// function swapLanguages() {
//   const temp = ipLan.value;
//   ipLan.value = opLan.value;
//   opLan.value = temp;
//   if (ipStr.value !== "") translate();
// }

// function clearHistory() {
//   ipStr.value = "";
//   opStr.value = "";
// }



let ipStr = document.getElementById("ipStr");
let opStr = document.getElementById("opStr");
let ipLan = document.getElementById("ipLan");
let opLan = document.getElementById("opLan");

const API_BASE = '/api/trans';

function translate() {
  if (ipStr.value !== "") {
    const url = "https://text-translator2.p.rapidapi.com/translate";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": "28a1aa8d66msh6d641cebad4d626p1c4f86jsn6d655bf181a3",
        "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
      },
      body: new URLSearchParams({
        source_language: ipLan.value,
        target_language: opLan.value,
        text: ipStr.value,
      }),
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        try {
          opStr.value = data.data.translatedText;
          sendToBackend(ipStr.value, data.data.translatedText, ipLan.value, opLan.value);
        } catch {
          opStr.placeholder = data.message;
        }
      })
      .catch((err) => console.error(err));
  } else {
    alert("Input can't be empty");
  }
}

function ajaxFun(str) {
  if (str === "") {
    opStr.value = "";
    return;
  }
  translate();
}

function swapLanguages() {
  const temp = ipLan.value;
  ipLan.value = opLan.value;
  opLan.value = temp;
  if (ipStr.value !== "") translate();
}

function clearHistory() {
  ipStr.value = "";
  opStr.value = "";

  const token = localStorage.getItem("token");
  fetch(`${API_BASE}`, {
    method: 'DELETE',
    credentials: 'include',
    'Authorization': `Bearer ${token}`
  })
    .then(res => res.json())
    .then(data => {
      const historyDiv = document.getElementById("history");
      if (historyDiv) historyDiv.innerHTML = "<p class='text-muted'>History cleared</p>";
    })
    .catch(err => console.error('Failed to clear history:', err));
}

function sendToBackend(inputText, translatedText, fromLang, toLang) {
  const historyItem = {
    fromText: inputText,
    toText: translatedText,
    fromLang,
    toLang,
    timestamp: Date.now()
  };

  const token = localStorage.getItem("token");
  fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(historyItem)
  }).catch(err => console.error('Backend sync error:', err));
}

function loadHistory() {
  const token = localStorage.getItem("token");
  fetch(`${API_BASE}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const historyDiv = document.getElementById("history");
      if (!historyDiv) return;
      historyDiv.innerHTML = "";
      data.reverse().forEach(item => {
        const entry = document.createElement("div");
        entry.className = "border rounded p-2 mb-2 bg-light";
        entry.innerHTML = `
          <strong>${item.fromLang}</strong>: ${item.fromText}<br />
          <strong>${item.toLang}</strong>: ${item.toText}<br />
          <small class="text-muted">${new Date(item.timestamp).toLocaleString()}</small>
        `;
        historyDiv.appendChild(entry);
      });
    })
    .catch(err => console.error('Failed to load history:', err));
}


document.getElementById("ipStr").addEventListener("input", (e) => {
  ajaxFun(e.target.value);
});


document.getElementById("swapBtn").addEventListener("click", swapLanguages);
document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
document.addEventListener("DOMContentLoaded", loadHistory);
