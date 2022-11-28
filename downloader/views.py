""" Importing render inorder to render the templates
    And HttpResponse to send httpresponse
    And Pytube for the core application
    And json load to load fetch request"""
import os
from json import load
from pathlib import Path
from django.shortcuts import render
from django.http import JsonResponse,HttpResponse
from pytube import YouTube, Playlist

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
    # Getting the Url from the request
    url = load(request)['url']

    if url:
        try:
            # Retrieving the url list in the playlist
            url_list = list(Playlist(url).video_urls)

            # stripping off the remaining part to get just the video id
            url_id_list = [x[len('https://www.youtube.com/watch?v='):] for x in url_list]

            # returning the video id
            return JsonResponse({'urlIdList' : url_id_list})

        # if the url is not youtube url
        # TODO Make a Better Error Handling than doing nothing
        except KeyError:
            return JsonResponse({'urlIdList': None})


    # if there is no url
    # TODO make a Better Error Handling 
    return JsonResponse({'urlIdList': None})

def download(request):
    '''Download the video of given id and return the download file'''
    # Getting urlid from request
    url_id = load(request)['urlId']
    # url_id = request.GET.get('urlId')

    # if urlid doesn't exist
    if not url_id:
        return JsonResponse('Error')

    # Creating a stream object of resolution 720p
    stream = YouTube(f"https://www.youtube.com/watch?v={url_id}").streams.get_by_itag(22)

    if  not stream:
        return JsonResponse('Error')

    video_name = stream.default_filename

    # downloading the video
    stream.download('videos', video_name)

    with open(f'videos//{video_name}', 'rb') as video_file:
        video_response = video_file.read()

    os.remove(f'videos//{video_name}')

    response = HttpResponse(video_response, headers = {
        'Content-Type':'application/octet-stream',
        'Content-Disposition':f'attachment; filename = {video_name}',
        'filename':f'{video_name}',
        'Access-Control-Expose-Headers': 'filename',
    })

    return response
