function downloadFile({ content, fileName, contentType }) {
  if (!content || !fileName) {
    throw new Error("Required params are not defined");
  }

  const a = document.createElement("a");
  const file = new Blob([content], {
    type: contentType || "applciation/octet-stream",
  });

  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = fileName;
  a.click();
}

export default downloadFile;
