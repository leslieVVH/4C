let likeCount = 3;
function increaseLikes() {
  likeCount++
  document.getElementById("likes").textContent = `${likeCount} like(s)`
}