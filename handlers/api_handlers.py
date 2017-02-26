from handlers.base_handlers import ModelHandler, PostHandler, BaseHandler
from tornado.web import authenticated, MissingArgumentError
from playhouse.shortcuts import model_to_dict
from peewee import IntegrityError, DoesNotExist
from models import User, Channel, ChannelConnection, Message, PrivateMessage
from datetime import datetime
from tornado import websocket
from helpers import datetime_serializer
import json


websockets = []

class MyUserProfileHandler(ModelHandler):

    @authenticated
    async def get(self):
        return self.write(self.current_user)

    @authenticated
    async def put(self):
        new_username = self.get_argument("username")
        user = self.current_user
        try:
            user.username = new_username
            user.new_user = False
            user.save()
            return self.write(user)
        except IntegrityError as e:
            return self.write(self.get_error_response(e))


class ChannelListHandler(PostHandler):

    model = Channel

    @authenticated
    async def get(self):
        return self.write(Channel.select().where(Channel.private == False))


class ChannelUserListHandler(ModelHandler):

    @authenticated
    async def get(self, channel_id):
        ids =[x.user_id for x in ChannelConnection.select().where(ChannelConnection.channel_id == channel_id)]
        return self.write(User.select().where(User.id << ids))


class ChannelMessagesListHandler(PostHandler):

    model = Message

    @authenticated
    async def get(self, channel_id):
        try:
            connection = ChannelConnection.get(user=self.current_user, channel_id=channel_id)
            try:
                start_time = datetime.strptime(self.get_argument("start_time"))
            except MissingArgumentError:
                start_time = datetime.fromtimestamp(0)

            connection.messages_last_fetched = datetime.now()
            connection.save()
            return self.write(Message.select().where(Message.channel_id == channel_id,
                                                     Message.timestamp > connection.join_date))

        except DoesNotExist:
            return self.write(json.dumps({
                "error": "Authenticated user has not joined the channel."
            }))

    @authenticated
    async def post(self, channel_id):
        try:
            connection = ChannelConnection.get(user=self.current_user, channel_id=channel_id)
            connection.messages_last_fetched = datetime.now()
            connection.save()

            obj = super().create_object({
                "user_id": self.current_user.id,
                "channel_id": channel_id,
                "timestamp": datetime.now()
            })
            if type(obj) != dict:
                for ws in websockets:
                    ws.new_message(obj)

            return self.write(obj)
        except DoesNotExist:
            return self.write(json.dumps({
                "error": "Authenticated user has not joined the channel."
            }))


class ChannelConnectionList(PostHandler):

    model = ChannelConnection

    def create_object(self, preset_data):
        try:
            data = self.get_model_arguments(self.model)
            data.update({
                "user_id": self.current_user,
                "join_date": datetime.now()
            })

            obj = ChannelConnection.create_channel_and_connection(**data)
            print(obj)
            for ws in websockets:
                ws.connection_update(obj, 'join')
            print(obj)
            return obj

        except IntegrityError as e:
            return self.get_error_response(e)

    @authenticated
    async def get(self):
        return self.write(ChannelConnection.select().where(ChannelConnection.user == self.current_user))


class ChannelConnectionDetail(ModelHandler):

    @authenticated
    async def delete(self, channel_id):
        try:
            connection = ChannelConnection.get(channel=channel_id, user=self.current_user)
            connection.delete_instance()
            for ws in websockets:
                ws.connection_update(connection, 'part')
            return self.write(connection)
        except DoesNotExist as e:
            return self.write(self.get_error_response(e))

    @authenticated
    async def get(self, channel_id):
        try:
            connection = ChannelConnection.get(channel=channel_id, user=self.current_user)
            return self.write(connection)
        except DoesNotExist as e:
            return self.write(self.get_error_response(e))


class WebsocketHandler(websocket.WebSocketHandler, BaseHandler):

    async def get(self, *args, **kwargs):
        if not self.current_user:
            self.set_status(401)
            self.finish("Unauthorized")
            return
        super().get(*args, **kwargs)

    def open(self, *args, **kwargs):
        websockets.append(self)

    def on_message(self, message):
        data = json.loads(message)
        if data['type'] == 'checkMessages':
            try:
                conn = ChannelConnection.get(user=self.current_user, channel=data['channelName'])
                conn.messages_last_fetched = datetime.now()
                print(conn.messages_last_fetched)
                conn.save()

            except:
                self.set_status(400)
                self.finish("Bad request")

    def connection_update(self, connection, operation):
        response_content = model_to_dict(connection)
        response_content['type'] = operation
        self.write_message(json.dumps(response_content, default=datetime_serializer))

    def new_message(self, new_message):
        conns = ChannelConnection.select().where(ChannelConnection.user == self.current_user,
                                                 ChannelConnection.channel == new_message.channel)

        response_content = model_to_dict(new_message)
        response_content['type'] = 'message'
        if len(conns) > 0:
            self.write_message(json.dumps(response_content, default=datetime_serializer))

    def on_close(self):
        websockets.remove(self)


class fullContextHandler(BaseHandler):

    async def get(self, *args, **kwargs):
        connections = ChannelConnection.select().where(ChannelConnection.user == self.current_user)
        messages = [Message.select().where(Message.channel == conn.channel, Message.timestamp > conn.join_date) for conn in connections]
        other_connections = [ChannelConnection.select().where(ChannelConnection.channel == conn.channel) for conn in connections]
        users = [[conn.user for conn in conns] for conns in other_connections]

        new_messages = []
        for i in range(len(connections)):
            if len(messages[i]) > 0 and connections[i].messages_last_fetched < max([msg.timestamp for msg in messages[i]]):
                print(connections[i].messages_last_fetched)
                print( max([msg.timestamp for msg in messages[i]]))
                new_messages.append(connections[i].channel.name)
            connections[i].messages_last_fetched = datetime.now()
            connections[i].save()

        new_messages_dict = {chan_name : True for chan_name in new_messages}

        connections_dicts = many_to_dict(connections)
        messages_dicts = [many_to_dict(x) for x in messages]
        users_dicts = [many_to_dict(x) for x in users]

        connections_raw = {connections[i].channel.name: connections_dicts[i] for i in range(len(connections))}
        messages_raw = {connections[i].channel.name: messages_dicts[i] for i in range(len(connections))}
        users_raw = {connections[i].channel.name: users_dicts[i] for i in range(len(connections))}

        model = {
            "channels": connections_raw,
            "messages": messages_raw,
            "users": users_raw,
            "new_messages": new_messages_dict
        }

        return self.write(json.dumps(model, default=datetime_serializer))


def many_to_dict(list):
    return [model_to_dict(x) for x in list]