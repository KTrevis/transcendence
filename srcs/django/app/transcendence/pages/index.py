from rest_framework.request import Request
from django.http.response import HttpResponse
from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth.models import User

def response(request: Request) -> HttpResponse:
	user: User = request.user
	return render(request, "index.html", {"USERNAME": user.username})