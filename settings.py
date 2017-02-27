import os

STATIC_DIRNAME = "static"

APPLICATION = {
    "template_path": "./templates/",
    "cookie_secret": os.environ["COOKIE_SECRET"],
    "login_url": "/login/",
    "xsrf_cookies": False,
    "debug": True,
    "static_path": os.path.join(os.path.dirname(__file__), STATIC_DIRNAME),
    "static_url_prefix": "/resources/",
    "auto_load": False
}

FACEBOOK_API_KEY = os.environ['FACEBOOK_API_KEY']
FACEBOOK_API_SECRET = os.environ['FACEBOOK_API_SECRET']

DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S"