from rest_framework.request import Request
from django.http.response import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from database.models import FriendList
from utils.friends import userToDict, getFriends
from django.contrib.auth.decorators import login_required

@login_required(login_url="/api/logout")
def response(request: Request) -> HttpResponse:
    error = request.query_params.get("Error")
    success = request.query_params.get("Success")
    if (error == None) :
        error = ""
    if (success == None) :
        success = ""
    
    return render(request, "rps/rps.html", {"ERROR_MESSAGE": error, "SUCCESS_MESSAGE" : success})