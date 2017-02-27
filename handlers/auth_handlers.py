from tornado import auth, gen
from handlers.base_handlers import BaseHandler
from models import User
from peewee import IntegrityError

import json
import database_connection
import settings


class FacebookLoginHandler(BaseHandler, auth.FacebookGraphMixin):

    async def _set_user(self, user_data):
        id = user_data["id"]
        name = user_data["first_name"]
        user = User.get_or_create(facebook_id=id, defaults={"facebook_id": id,
                                                            "username": name,
                                                            "first_name": name})[0]

        self.set_secure_cookie("user", str(user.id))

    async def get(self):
        if not self.current_user:

            if self.get_argument('code', False):
                user_data = await self.get_authenticated_user(
                    client_id=settings.FACEBOOK_API_KEY,
                    client_secret=settings.FACEBOOK_API_SECRET,
                    redirect_uri=settings.URL + '/complete/facebook/',
                    code=self.get_argument('code'))

                try:
                    await self._set_user(user_data)
                    return self.redirect("/")

                except IntegrityError as e:
                    data = {
                            "error":str(e)
                    }
                    return self.write(json.dumps(e))


            else:
                await self.authorize_redirect(
                    redirect_uri=settings.URL +'/complete/facebook/',
                    client_id=settings.FACEBOOK_API_KEY,
                    response_type='code',
                )
        else:
            return self.redirect("/")


class LogoutHandler(BaseHandler):

    def get(self):
        if self.current_user:
            self.set_secure_cookie("user", "")
        return self.redirect("/")