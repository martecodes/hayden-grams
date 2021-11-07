const trash = document.getElementsByClassName("fa-trash-alt")

Array.from(trash).forEach(function (element) {
    element.addEventListener('click', function () {
        const id = this.parentNode.parentNode.childNodes[3].innerText.trim("\n")

        fetch('/postDelete', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _id: id,
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