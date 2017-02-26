from peewee import Model, SqliteDatabase

db = SqliteDatabase('kampela.db')


class BaseModel(Model):
    class Meta:
        database = db

