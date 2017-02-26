from tornado import web

from handlers.base_handlers import BaseHandler
from playhouse.shortcuts import model_to_dict

import json


class LoginViewHandler(BaseHandler):

    async def get(self):
        return self.render('index.html')


class ChatViewHandler(BaseHandler):

    @web.authenticated
    async def get(self):
        return self.render('chat_view.html', user=json.dumps(model_to_dict(self.current_user)))