from tornado import web, ioloop, httpserver

from handlers import api_handlers, auth_handlers, view_handlers
import settings, os


def make_app():
    return web.Application([
        # Views
        (r"^/", view_handlers.LoginViewHandler),
        (r"^/([0-9]+)/$", view_handlers.LoginViewHandler),
        # Auth
        (r"^/complete/facebook/$", auth_handlers.FacebookLoginHandler),
        (r"^/login/$", auth_handlers.FacebookLoginHandler),
        (r"^/logout/$", auth_handlers.LogoutHandler),
        # API
        (r"^/me/$", api_handlers.MyUserProfileHandler),
        (r"^/chat/$", view_handlers.ChatViewHandler),
        (r"^/channels/$", api_handlers.ChannelListHandler),
        (r"^/channels/([0-9A-Za-z_-]+)/users/$", api_handlers.ChannelUserListHandler),
        (r"^/channels/([0-9A-Za-z_-]+)/messages/$", api_handlers.ChannelMessagesListHandler),
        (r"^/connections/$", api_handlers.ChannelConnectionList),
        (r"^/connections/([0-9A-Za-z_-]+)/$", api_handlers.ChannelConnectionDetail),
        (r"^/ws/$", api_handlers.WebsocketHandler),
        (r"^/context/$", api_handlers.fullContextHandler)
    ], **settings.APPLICATION)

if __name__ == "__main__":
    app = make_app()
    http_server = httpserver.HTTPServer(app)
    port = int(os.environ.get("PORT", 5000))
    http_server.listen(port)
    ioloop.IOLoop.instance().start()


