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

class RPSGame:
    player:User
    opponent:User
    choice: str

rpsGame: dict[int, RPSGame] = {}

async def response(request: Request) -> HttpResponse:
    id = request.query_params.get("id")
    print("00000000000000000000000000000000000000000000000000", flush=True)
    if id is None:
        return redirect("/")
    id = int(id)
    user1: User
    try :
        user1 = await User.objects.aget(id=id)
        print(user1.username, flush=True)
    except :
        return (redirect("/"))
    user2:User = request.user
    await sendMessageWS(user1, "rps", json.dumps({"type": "invitation_accepted", "from": user2.username, "id": user2.id}))

    return render(request, "rps/game.html")