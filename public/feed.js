const likes = document.getElementsByClassName("postHeart");

Array.from(likes).forEach(function (element) {
  element.addEventListener('click', function () {
    const id = this.parentNode.parentNode.parentNode.childNodes[1].innerText.trim('\n')
    const likes = parseFloat(this.parentNode.parentNode.childNodes[1].innerText)
    fetch('postLikes', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: id,
        likes: likes
      })
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        window.location.reload(true)
      })
  });
});



