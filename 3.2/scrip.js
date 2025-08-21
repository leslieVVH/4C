let likes = [9, 12, 9];

function addLike(index) {
  likes[index]++;
  document.getElementById(`likes-${index}`).textContent = likes[index];
}
