export default function (className) {
  const icon = document.createElement("i");
  const classList = className.split(" ");

  classList.forEach((name) => {
    icon.classList.add(name);
  });

  return icon;
}
