""" Importing render inorder to render the templates
    And HttpResponse to send httpresponse
    And Pytube for the core application
    And json load to load fetch request
    And moviepy as there is a requirement to combine audio and video file
    And iri_to_uri to pass Non ASCII characters via http headers
"""
import os
from json import load
from pathlib import Path
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.utils.encoding import iri_to_uri
from pytube import YouTube, Playlist
from moviepy.video.io.ffmpeg_tools import ffmpeg_merge_video_audio

BASE_DIR = Path(__file__).resolve().parent.parent

# Create your views here.


def index(request):
    """ Main page of the site"""
    if request.method == "GET":
        return render(request, "index.html")
    else:
        return retrieve(request)


def retrieve(request):
    """Retrieve data about the given url"""
    # Getting the Url from the request to get the url from form submti
    playlist_url = load(request)['url']

    if playlist_url:
        if 'youtu' not in playlist_url:
            raise ValueError
        # Storing data of urls in a list to send that data as json
        # Creating a list to create a element for each url
        # Each element is a dictionary with url and quality
        # quality is a list that contains tuples with itag and size
        # However name of the format is not passed and is rather stored in client side
        elif 'list' in playlist_url:
            url_list = list(Playlist(playlist_url).video_urls)
        elif 'watch' in playlist_url:
            url_list = [playlist_url]
        else:
            raise ValueError
        response_list = []
        for url in url_list:
            length = len('https://www.youtube.com/watch?v=')
            url_dict = {}
            url_dict['urlId'] = url[length: length+11]
            yt_streams = YouTube(url).streams

            # Checking for the format available to download in website
            # so it can be sent along with it's size
            # the list is in the order [1080p, 720p, 480p, 360p, audio/mp4]
            # However the 140 tag will be referred as mp3
            # as we'll be converting audio/mp4 to mp3
            quality_list = []
            for itag in [137, 22, 135, 18, 140]:
                stream = yt_streams.get_by_itag(itag)
                if stream:
                    quality = (itag, int(stream.filesize/1024/1024))
                    quality_list.append(quality)

            url_dict['quality'] = quality_list
            response_list.append(url_dict)

        # returning the video id
        return JsonResponse({'response_list': response_list})

    # if there is no url
    raise ValueError


def download(request):
    '''Download the video of given id and return the download file'''
    # Getting urlid from request

    response_json = load(request)
    url_id, itag = response_json['urlId'], response_json['qualityItag']

    # If user does something fishy
    if not url_id or itag not in ['18', '125', '22', '137', '140']:
        raise ValueError

    # Creating a stream object of given resolution
    if itag in ['137', '140']:
        # donwloading the audio as it's required for 1080p downloads and for mp3
        audio_stream = YouTube(
            f"https://www.youtube.com/watch?v={url_id}").streams.get_by_itag(140)
        # changing the name to .mp3
        if audio_stream:
            audio_filename = audio_stream.default_filename[:-4] + '.mp3'
            audio_stream.download('videos', audio_filename)
        else:
            raise ValueError

        if itag == '137':
            # donwloading 1080p video
            video_stream = YouTube(
                f"https://www.youtube.com/watch?v={url_id}").streams.get_by_itag(137)
            if video_stream:
                video_filename = video_stream.default_filename
                video_stream.download('videos', 'a' + video_filename)
            else:
                raise ValueError

            # mixing audio and video files
            cwd = os.getcwd()
            ffmpeg_merge_video_audio(cwd + f'/videos/{"a" + video_filename}', cwd + f'/videos/{audio_filename}', cwd + f'/videos/{video_filename}')

            filename = video_filename
            os.remove(f'videos//{audio_filename}')
            os.remove(f'videos//{"a" + filename}')
        else:
            filename = audio_filename
    else:
        stream = YouTube(
            f"https://www.youtube.com/watch?v={url_id}").streams.get_by_itag(itag)

        if not stream:
            return JsonResponse('Error')

        filename = stream.default_filename

        # downloading the video
        stream.download('videos', filename)

    with open(f'videos//{filename}', 'rb') as video_file:
        video_response = video_file.read()

    os.remove(f'videos//{ filename}')

    response = HttpResponse(video_response, headers={
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': f'attachment; filename = {filename}',
        'filename': f'{iri_to_uri(filename)}',
        'Access-Control-Expose-Headers': 'filename',
    })

    return response
