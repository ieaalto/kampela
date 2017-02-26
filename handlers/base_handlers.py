from tornado import web
from playhouse.shortcuts import model_to_dict
from helpers import datetime_serializer

import peewee
import database_connection
import models
import json


class BaseHandler(web.RequestHandler):

    def get_current_user(self):
        user_id = self.get_secure_cookie("user")
        if user_id:
            try:
                return models.User.get(id=user_id)
            except peewee.DoesNotExist:
                return None
        else:
            return None

    def prepare(self):
        database_connection.db.connect()
        return super().prepare()

    def on_finish(self):
        if not database_connection.db.is_closed():
            database_connection.db.close()
        return super().on_finish()


class ModelHandler(BaseHandler):

    def get_error_response(self, error):
        data = {
            "error": str(error)
        }

        return json.dumps(data)

    def write(self, chunk):
        if isinstance(chunk, database_connection.BaseModel):
            return super().write(json.dumps(model_to_dict(chunk), default=datetime_serializer))

        if isinstance(chunk, peewee.SelectQuery):
            return super().write(json.dumps([model_to_dict(x) for x in chunk], default=datetime_serializer))

        else: return super().write(chunk)

    def get_model_arguments(self, model):
        data = {}
        fields = model._meta.sorted_field_names
        for field in fields:
            try:
                data[field] = self.get_argument(field)
            except:
                pass

        return data


class PostHandler(ModelHandler):

    model = None

    def create_object(self, preset_data):
        try:
            data = self.get_model_arguments(self.model)
            if preset_data:
                data.update(preset_data)
            obj = self.model.create(**data)
            return obj

        except peewee.IntegrityError as e:
            return self.get_error_response(e)

    async def post(self, preset_data=None, *args, **kwargs):
        return self.write(self.create_object(preset_data))

