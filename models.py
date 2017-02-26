from peewee import *
from datetime import datetime
from database_connection import BaseModel


class User(BaseModel):
    username = CharField(max_length=30, unique=True, constraints=[Check("username != ''")])
    facebook_id = CharField(max_length=64)
    first_name = CharField(max_length=64)
    new_user = BooleanField(default=True)


class Channel(BaseModel):
    name = CharField(max_length=30, primary_key=True)
    private = BooleanField(default=False)


class ChannelConnection(BaseModel):
    user = ForeignKeyField(User, on_delete='CASCADE')
    channel = ForeignKeyField(Channel, on_delete='CASCADE')
    join_date = DateTimeField(default=datetime.now())
    messages_last_fetched = DateTimeField(default=datetime.fromtimestamp(0))

    @classmethod
    def create_channel_and_connection(cls, private=False, **query):
        channel, created = Channel.get_or_create(name=query["channel"])
        if created:
            channel.private = private
            channel.save()

        return cls.create(**query)

    def delete_instance(self, *args, **kwargs):
        super().delete_instance(self, *args, **kwargs)

        Channel.delete().where(Channel.id not in [x.channel_id for x in ChannelConnection.select()])


class Message(BaseModel):
    user = ForeignKeyField(User, on_delete='CASCADE')
    channel = ForeignKeyField(Channel, on_delete='CASCADE')
    content = TextField()
    timestamp = DateTimeField(default=datetime.now())


class PrivateMessage(BaseModel):
    sender = ForeignKeyField(User, on_delete='CASCADE', related_name='sender')
    receiver = ForeignKeyField(User, on_delete='CASCADE', related_name='receiver')
    content = TextField()
    timestamp = DateTimeField(default=datetime.now())





