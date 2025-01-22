from rest_framework.request import Request
from django.http.response import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from database.models import FriendList
from utils.friends import userToDict, getFriends
from django.contrib.auth.decorators import login_required
from utils.websocket import sendMessageWS
import json

@login_required(login_url="/api/logout")
async def response(request: Request) -> HttpResponse:
    id = request.query_params.get("id")

    if id is None:
        return redirect("/")
    id = int(id)
    user1: User
    try :
        user1 = await User.objects.aget(id=id)
    except :
        return (redirect("/"))
    user2 = request.user
    await sendMessageWS(user1, "rps", json.dumps({"type": "invitation_accepted"}))
    return render(request, "rps/game.html")