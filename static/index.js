function workaround() {
    let html = '';
    fetch('', {

        method: "POST",

        body: JSON.stringify({
            url: `${document.querySelector('#url').value}`
        }),

        credentials: 'same-origin',

        headers: {
            "X-CSRFToken": document.querySelector('[name = "csrfmiddlewaretoken"]').value
        },
    })
        .then(response => response.json())
        .then((json) => {
            if (json['urlIdList'] != null) {
                // creating a all download button 
                html +=
                    `<div>
                        <button id="download-all" value=${json['urlIdList']}>Download All</button>
                    </div>`
                // Adding each video in html
                json['urlIdList'].forEach(url => {
                    html +=
                        `<div class="mb-3">
                            <iframe src="https://www.youtube.com/embed/${url}" frameborder = "0" ></iframe >
                            <button id="download-button" name="urlId" value="${url}">Download</button>
                        </div>`
                });
                // adding the produced html
                document.getElementById('videos').innerHTML = html;
                // adding event listeners to all individual download button
                document.querySelectorAll('#download-button').forEach(btn => {
                    btn.addEventListener('click', downloadVideo)
                })
                // adding event listener to all download button
                document.querySelector('#download-all').addEventListener('click', () => {
                    document.querySelectorAll('#download-button').forEach(btn => {
                        btn.click()
                    })
                })

            }
        })
}

function downloadVideo() {
    let filename;
    fetch('/download', {

        method: "POST",

        body: JSON.stringify({
            urlId: `${this.value}`
        }),

        credentials: 'same-origin',

        headers: {
            "X-CSRFToken": document.querySelector('[name = "csrfmiddlewaretoken"]').value
        },
    })
        .then(response => {
            // filename = response.headers.get("content-disposition").split(";")[1].split('"')[1];
            filename = response.headers.get('filename')
            console.log(filename);
            return response.blob();
        })
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url);
        })
}