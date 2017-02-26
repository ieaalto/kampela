from datetime import datetime
from settings import DATETIME_FORMAT


def datetime_serializer(obj):
    if isinstance(obj, datetime):
        serial = datetime.strftime(obj, DATETIME_FORMAT)
        return serial
    raise TypeError("Type not serializable")