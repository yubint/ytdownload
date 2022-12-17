function workaround() {
    // adding spinner effect
    document.querySelector('.spinner-submit').hidden = false;
    document.getElementById('url-submit').disabled = true;
    // clearing error message that might've been shown before
    document.getElementById('error').innerText = ''
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
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error('status not okay');
            }
        })
        .then((json) => {
            let responseList = json['response_list']
            if (responseList != null) {
                if (responseList.length > 1) {
                    // creating a all download button as there are more than one video 
                    html +=
                        `<div class='all-downloader'>
                            <button class='btn btn-primary mb-4 mx-2' id="download-all" type='submit'>Download All</button>
                            <button class='btn btn-primary mb-4 mx-2' id="download-mp3" type='submit'>Download Mp3</button> 
                        </div>`
                }
                // Adding each video in html
                let qualityJson = {
                    '18': '360p',
                    '135': '480p',
                    '22': '720p',
                    '137': '1080p',
                    '140': 'mp3',
                }
                responseList.forEach(urlJson => {
                    html +=
                        `<div class="mb-3">
                            <iframe class='mb-3 mx-2' src="https://www.youtube.com/embed/${urlJson['urlId']}" frameborder = "0" ></iframe >
                            <button class='btn btn-primary download-button mx-1' id="download-button" name="urlId" type='submit' value="${urlJson['urlId']}">Download</button>
                            <select class='form form-select quality-select mx-1' id='${urlJson['urlId'] + 'quality'}' name='quality'> `
                    urlJson['quality'].forEach(qualityArray => {
                        // qualityArray has 2 elements , first is itag for quality and second is size
                        html +=
                            `<option value='${qualityArray[0]}'>${qualityJson[String(qualityArray[0])]}</option>`
                    })
                    html +=
                        `</select>
                        <div class="spinner-border mx-3 spinner-download" id='${urlJson['urlId'] + 'spinner'}' hidden  role="status">
                        <span class="visually-hidden">Loading...</span>
                        </div>
                        </div >`
                });
                // adding the produced html
                document.getElementById('main').hidden = false;
                document.getElementById('videos').innerHTML = html;
                document.querySelector('.half-border').hidden = false;
                // adding event listeners to all individual download button
                document.querySelectorAll('#download-button').forEach(btn => {
                    btn.addEventListener('click', downloadVideo)
                })
                // adding event listener to all download button
                if (document.querySelector('#download-all') != null) {
                    document.querySelector('#download-all').addEventListener('click', () => {
                        document.querySelectorAll('#download-button').forEach(btn => {
                            btn.click()
                        })
                    })
                }

                // adding event listener to mp3 download button
                if (document.querySelector('#download-mp3') != null) {
                    document.querySelector('#download-mp3').addEventListener('click', () => {
                        document.querySelectorAll('.form-select').forEach(self => {
                            self.value = '140';
                        });
                        document.querySelector('#download-all').click()
                    })
                }
            }

        })
        .catch(() => {
            document.getElementById('error').innerText = 'Oops Some Error Occured!'
        })
        .finally(() => {
            // removing the spinner effect
            document.querySelector('.spinner-submit').hidden = true;
            document.getElementById('url-submit').disabled = false;
        }
        )
}

function downloadVideo() {
    // disable the button
    let downloadButton = this;
    downloadButton.disabled = true;
    // add spinner
    let spinner = document.getElementById(this.value + 'spinner');
    spinner.hidden = false;
    // remove any error message
    document.getElementById('error').innerText = '';
    let filename;
    fetch('/download', {

        method: "POST",

        body: JSON.stringify({
            urlId: `${this.value}`,
            qualityItag: `${document.getElementById(this.value + 'quality').value}`
        }),

        credentials: 'same-origin',

        headers: {
            "X-CSRFToken": document.querySelector('[name = "csrfmiddlewaretoken"]').value
        },
    })
        .then(response => {
            if (response.ok) {
                filename = decodeURIComponent(response.headers.get('filename'));
                return response.blob();
            }
            else {
                throw new Error("isn't looking good mate");
            }
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
        .catch(() => {
            document.getElementById('error').innerText = "Oops! Problem while downloading";
        })
        .finally(() => {
            spinner.hidden = true;
            downloadButton.disabled = false;
        })
}