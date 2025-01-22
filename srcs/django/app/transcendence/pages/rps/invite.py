from utils.websocket import sendMessageWS
from rest_framework.request import Request
from django.http.response import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import json

@login_required(login_url="/api/logout")
async def response(request: Request) -> HttpResponse:
    username = request.query_params.get("username")
    user: User = None
    if request.user.username == username :
        return (redirect("/rps?Error=you cannot invite yourself"))

    try :
        user = await User.objects.aget(username=username)
    except :
        return (redirect("/rps?Error=user not found"))
    msg = json.dumps({
        "message": f"<a href=/rps/game?id={request.user.id}>rps invitation received from {request.user.username}</a>"
    })
    await sendMessageWS(user, "notifications", msg)
    return (redirect("/rps?Success=invitation sent"))


