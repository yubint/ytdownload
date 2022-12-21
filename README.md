# ytdownload
Can download files in a Youtube Playlist individually

Video Demo Here : https://www.youtube.com/watch?v=poDiKkoFZ2c

Text Demo:
## How to use and what to use for
1. Enter the link in the box that states Enter the url
2. Click Submit and wait till the spinner stops spinning
3. There appears a list of videos on that playlist
4. There is a individual download buton on the side of each video and a download all button
5. Download All button downloads all the videos on the specified quality located near each video
6. Download Mp3 download all the videos in mp3 format
7. Can also be used for downloading individual files  

## How does it work
 The project uses pytube as its main component to download the youtube videos in the required format 
 And it uses Django to serve this webapp. Another module used is moviepy. It is used in order to merge
 video and audio using ffmpeg in 1080p downloads as pytube requires that in order to download a 1080p video.  

## Installing in your local machine
First Create a virtual environment and then activate that virtual environment. Then clone the repository on your local machine using  

    git clone git@github.com:yubint/ytdownload   
And then you can see that there is a requirements.txt file in ytdownload folder. you can install the packages inside the requirements.txt using the 
following command once you are in the ytdownload directory   

    pip install -r requirements.txt   
Then you can use the following command to run the development server of the webapp

    python manage.py runserver

And then you can go to the specified address to access the webapp

## Design Choices
### Use of fetch API and single page app
I felt it that it was neat that it would be a single page application with fetch API but the django server returns only the required data and the html is generated using javascript which will be improved to be rendered by the server itself. For now it is the javascript doing all the work to create the html.

### Individual Download of videos
The app uses fetch and blob to download files and get multiple responses from server by putting multiple requests from the same page. For now the request are POST but they can and will me made into GET request in future version. 




 