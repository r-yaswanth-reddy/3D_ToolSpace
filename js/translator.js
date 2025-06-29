let ipStr = document.getElementById("ipStr");
let opStr = document.getElementById("opStr");
let ipLan = document.getElementById("ipLan");
let opLan = document.getElementById("opLan");

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
}
