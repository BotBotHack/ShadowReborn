const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}
