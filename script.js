let inputText = document.getElementById("writeText");
const writeButton = document.getElementById("writeButton");
const writeLog = document.getElementById("writeLog");

const readButton = document.getElementById("readButton");
const readText = document.getElementById("readText");
const readSerial = document.getElementById("readSerial");
const readLog = document.getElementById("readLog");

writeButton.addEventListener("click", async () => {
  console.log("write button clicked");
  writeLog.textContent = await "please touch the NFC tag!";
  try {
    let writeText = inputText.value
    console.log(writeText)
    if (!writeText) {
      writeLog.textContent = "empty";
      return;
    }
    const reader = new NDEFReader();
    await reader.write(writeText);
    writeLog.textContent = `write: ${writeText}`;
  } catch (error) {
    writeLog.textContent = error;
    console.log(error);
  }
});

readButton.addEventListener("click", async () => {
  readLog.textContent = await "clicked read button";
  try {
    const reader = new NDEFReader();
    await reader.scan();
    readLog.textContent = "scan started";

    reader.addEventListener("error", () => {
      console.log("Error");
      readLog.textContent = "scan error";
    });

    reader.addEventListener("reading", ({ message, serialNumber }) => {
      console.log(`> Serial Number: ${serialNumber}`);
      console.log(message);
      //const messageString = JSON.stringify(message);
      const messageString = "records count=" + message.records.length;
      readLog.textContent = messageString;
      const serialString = `Serial Number: ${serialNumber}`
      readSerial.textContent = serialString;

      let str = "";
      for (const record of message.records) {
        str += (decodeRecord(record) + "<br />\n");
      }
      readText.textContent = str;
    });
  } catch (error) {
    readLog.textContent = error;
  }
});

function decodeRecord(record) {
  const { data, encoding, recordType } = record;
  // if (recordType === "text") {
  //   const textDecoder = new TextDecoder(encoding);
  //   const text = textDecoder.decode(data);
  //   return text;
  // }

  switch (recordType) {
    case "text":
      const textDecoder = new TextDecoder(encoding);
      const text = "text: " + textDecoder.decode(data);
      return text;

    case "url":
      const decoder = new TextDecoder();
      const url = "url: " + decoder.decode(data);
      return url;

    case "mime":
      if (record.mediaType === "application/json") {
        const decoder = new TextDecoder();
        const json = "JSON: " + decoder.decode(data);
        return json;
      }
      else if (record.mediaType.startsWith("image/")) {
        return "image";

        // const blob = new Blob([record.data], { type: record.mediaType });

        // const img = document.createElement("img");
        // img.src = URL.createObjectURL(blob);
        // img.onload = () => window.URL.revokeObjectURL(this.src);

        // document.body.appendChild(img);
      }
      else {
        return "Media not handled";
      }
    default:
      return "Record not handled";
  }
}