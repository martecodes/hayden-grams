const commentlikes = document.getElementsByClassName("commentsHeart");
const postLikes = document.getElementsByClassName("postHeart");
const trash = document.getElementsByClassName("fa-trash-alt")

Array.from(commentlikes).forEach(function (element) {
  element.addEventListener('click', function () {
    const id = this.parentNode.parentNode.childNodes[5].innerText.trim("\n")
    const likes = parseFloat(this.parentNode.parentNode.childNodes[11].innerText)

    console.log(likes);
    console.log(id);

    fetch('/commentLikes', {
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

Array.from(postLikes).forEach(function (element) {
  element.addEventListener('click', function () {
    const id = this.parentNode.parentNode.childNodes[1].innerText.trim("\n")
    const likes = parseFloat(this.parentNode.parentNode.childNodes[9].innerText)

    fetch('/postLikes', {
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

  Array.from(trash).forEach(function (element) {
    element.addEventListener('click', function () {
      const id = this.parentNode.parentNode.childNodes[5].innerText.trim("\n")
      const comment = this.parentNode.parentNode.childNodes[9].innerText.trim()
    
      fetch('/commentDelete', {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: id,
          comment: comment
        })
      })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        window.location.reload(true)
      });
    });
  });
});