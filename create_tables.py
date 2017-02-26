import sys, inspect, models
from database_connection import BaseModel,db

model_classes = inspect.getmembers(
    sys.modules["models"], lambda member: (inspect.isclass(member) and
                                           member.__module__ == "models" and
                                           issubclass(member, BaseModel)))

db.create_tables([x[1] for x in model_classes])