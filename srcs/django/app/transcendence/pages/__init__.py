from . import auth
from . import index
from . import settings
from . import friends
from .pong import lobby

from .api.auth import login, logout, register

from .api.friends import addFriend, acceptFriend, removeFriend, sendMessage