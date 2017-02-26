import os

STATIC_DIRNAME = "static"

APPLICATION = {
    "template_path": "./templates/",
    "cookie_secret": 'KhOKFGTQWRUboChQnUnVErJLSdo8Fazp8D3aIAxRs3rLlZrA5LxkxvEmNPAsPRIN',
    "login_url": "/login/",
    "xsrf_cookies": False,
    "debug": True,
    "static_path": os.path.join(os.path.dirname(__file__), STATIC_DIRNAME),
    "static_url_prefix": "/resources/",
    "auto_load": False
}

FACEBOOK_API_KEY = '481044718950084'
FACEBOOK_API_SECRET = '82391edc7320475e1547d077e52fd65c'

DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S"