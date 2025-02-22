from . import auth
from . import index
from . import settings
from . import friends
from . import play
from . import profile
from .pong import result
from . import update_settings

from .tournament import create as tournamentCreate
from .tournament import lobby as tournamentLobby
from .tournament import leave as tournamentLeave
from .tournament import start as tournamentStart
from .tournament import kick as tournamentKick

from .pong import lobby

from .api.auth import login, logout, register

from .api.friends import addFriend, acceptFriend, removeFriend, sendMessage, openMessage
