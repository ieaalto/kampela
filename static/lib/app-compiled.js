'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var initializeFB = require('../src/initialize_fb.js').initialize;
var moment = require('moment');
var API = require('../src/api.js');

function get_picture_url(user, width, height) {
    return new Promise(function (resolve) {
        FB.api(user.facebook_id + '/picture', 'get', { width: width, height: height }, function (resp) {
            resolve(resp.data.url);
        });
    });
}

var WelcomeScreen = function (_React$Component) {
    _inherits(WelcomeScreen, _React$Component);

    function WelcomeScreen(props) {
        _classCallCheck(this, WelcomeScreen);

        var _this = _possibleConstructorReturn(this, (WelcomeScreen.__proto__ || Object.getPrototypeOf(WelcomeScreen)).call(this, props));

        _this.state = {
            image_loaded: false,
            error: "",
            value: ""
        };

        initializeFB.then(function () {
            get_picture_url(_this.props.user, 150, 150).then(function (url) {
                _this.image_url = url;

                _this.setState({
                    image_loaded: true
                });
            });
        });

        _this.handleChange = _this.handleChange.bind(_this);
        _this.handleSubmit = _this.handleSubmit.bind(_this);
        return _this;
    }

    _createClass(WelcomeScreen, [{
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            var _this2 = this;

            event.preventDefault();
            API.changeUsername(this.state.value).then(function (response) {
                if (response.error) {
                    _this2.setState({ error: 'The username is already taken!' });
                } else {
                    _this2.props.updateUser(response);
                }
            });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            this.setState({
                value: event.target.value,
                error: ''
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var image = _react2.default.createElement('div', null);

            if (this.state.image_loaded) {
                image = _react2.default.createElement('img', { src: this.image_url, alt: 'Profile picture' });
            }

            return _react2.default.createElement(
                'div',
                { className: 'usernameSelectionBackground' },
                _react2.default.createElement(
                    'div',
                    { className: 'usernameSelection' },
                    _react2.default.createElement(
                        'h3',
                        null,
                        'Welcome, ',
                        this.props.user.first_name,
                        '!'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'imageContainer' },
                        image
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        'Choose your username:'
                    ),
                    _react2.default.createElement(
                        'form',
                        { onSubmit: this.handleSubmit, className: 'form-group' },
                        _react2.default.createElement('input', { type: 'text', value: this.state.value, onChange: this.handleChange, className: 'form-control' }),
                        _react2.default.createElement('input', { type: 'submit', value: 'Submit', className: 'form-control' }),
                        _react2.default.createElement(
                            'p',
                            null,
                            this.state.error
                        )
                    )
                )
            );
        }
    }]);

    return WelcomeScreen;
}(_react2.default.Component);

var ChannelListItem = function (_React$Component2) {
    _inherits(ChannelListItem, _React$Component2);

    function ChannelListItem(props) {
        _classCallCheck(this, ChannelListItem);

        var _this3 = _possibleConstructorReturn(this, (ChannelListItem.__proto__ || Object.getPrototypeOf(ChannelListItem)).call(this, props));

        _this3.handleClick = _this3.handleClick.bind(_this3);
        return _this3;
    }

    _createClass(ChannelListItem, [{
        key: 'handleClick',
        value: function handleClick() {
            this.props.onClick(this.props.channel);
        }
    }, {
        key: 'render',
        value: function render() {
            var className = "channelListItem";
            if (this.props.new_messages) className = "channelListItem-new-messages";
            if (this.props.channel.name === this.props.selectedChannel) className = "channelListItem-selected";

            return _react2.default.createElement(
                'li',
                { className: className, key: this.props.channel.name, onClick: this.handleClick, id: this.props.channel.name },
                '#',
                this.props.channel.name
            );
        }
    }]);

    return ChannelListItem;
}(_react2.default.Component);

var Hideable = function (_React$Component3) {
    _inherits(Hideable, _React$Component3);

    function Hideable(props) {
        _classCallCheck(this, Hideable);

        var _this4 = _possibleConstructorReturn(this, (Hideable.__proto__ || Object.getPrototypeOf(Hideable)).call(this, props));

        _this4.state = {
            display: true
        };
        _this4.toggleVisibility = _this4.toggleVisibility.bind(_this4);
        return _this4;
    }

    _createClass(Hideable, [{
        key: 'toggleVisibility',
        value: function toggleVisibility() {
            this.setState({
                display: !this.state.display
            });
        }
    }]);

    return Hideable;
}(_react2.default.Component);

var ChannelList = function (_Hideable) {
    _inherits(ChannelList, _Hideable);

    function ChannelList() {
        _classCallCheck(this, ChannelList);

        return _possibleConstructorReturn(this, (ChannelList.__proto__ || Object.getPrototypeOf(ChannelList)).apply(this, arguments));
    }

    _createClass(ChannelList, [{
        key: 'render',
        value: function render() {
            var _this6 = this;

            var items = Object.values(this.props.channels).map(function (channel) {
                return _react2.default.createElement(ChannelListItem, { channel: channel.channel, selectedChannel: _this6.props.selectedChannel, onClick: _this6.props.onClick, new_messages: _this6.props.new_messages[channel.channel.name] });
            });

            return _react2.default.createElement(
                'div',
                { className: 'channelList' },
                _react2.default.createElement(
                    'div',
                    { className: 'titleBar' },
                    _react2.default.createElement(
                        'h4',
                        null,
                        'Channels'
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'hidden-lg-up' },
                        ' ',
                        _react2.default.createElement(
                            'button',
                            { type: 'button', className: 'hideButton', onClick: this.toggleVisibility },
                            this.state.display ? "Hide" : "Show"
                        ),
                        ' '
                    )
                ),
                this.state.display && _react2.default.createElement(
                    'ul',
                    null,
                    items
                )
            );
        }
    }]);

    return ChannelList;
}(Hideable);

var UserListItem = function (_React$Component4) {
    _inherits(UserListItem, _React$Component4);

    function UserListItem(props) {
        _classCallCheck(this, UserListItem);

        var _this7 = _possibleConstructorReturn(this, (UserListItem.__proto__ || Object.getPrototypeOf(UserListItem)).call(this, props));

        _this7.state = {
            image_loaded: false
        };

        initializeFB.then(function () {
            get_picture_url(_this7.props.user, 50, 50).then(function (url) {
                _this7.image_url = url;

                _this7.setState({
                    image_loaded: true
                });
            });
        });
        return _this7;
    }

    _createClass(UserListItem, [{
        key: 'render',
        value: function render() {
            var image = _react2.default.createElement('span', null);

            if (this.state.image_loaded) {
                image = _react2.default.createElement('img', { src: this.image_url, alt: 'Profile picture' });
            }

            return _react2.default.createElement(
                'li',
                { className: 'userListItem', key: this.props.user.username },
                _react2.default.createElement(
                    'div',
                    { className: 'userListItem-image-container' },
                    image
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'userListItemElement' },
                    _react2.default.createElement(
                        'div',
                        null,
                        ' ',
                        _react2.default.createElement(
                            'b',
                            null,
                            this.props.user.username
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        ' ',
                        _react2.default.createElement(
                            'i',
                            null,
                            this.props.user.first_name
                        ),
                        ' '
                    )
                )
            );
        }
    }]);

    return UserListItem;
}(_react2.default.Component);

var UserList = function (_Hideable2) {
    _inherits(UserList, _Hideable2);

    function UserList() {
        _classCallCheck(this, UserList);

        return _possibleConstructorReturn(this, (UserList.__proto__ || Object.getPrototypeOf(UserList)).apply(this, arguments));
    }

    _createClass(UserList, [{
        key: 'render',
        value: function render() {
            var items = this.props.users.map(function (user) {
                return _react2.default.createElement(UserListItem, { user: user });
            });
            return _react2.default.createElement(
                'div',
                { className: 'userList' },
                _react2.default.createElement(
                    'div',
                    { className: 'titleBar' },
                    _react2.default.createElement(
                        'h4',
                        null,
                        'Users'
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'hidden-lg-up' },
                        ' ',
                        _react2.default.createElement(
                            'button',
                            { type: 'button', className: 'hideButton', onClick: this.toggleVisibility },
                            this.state.display ? "Hide" : "Show"
                        ),
                        ' '
                    )
                ),
                this.state.display && _react2.default.createElement(
                    'ul',
                    null,
                    items
                )
            );
        }
    }]);

    return UserList;
}(Hideable);

var Message = function (_React$Component5) {
    _inherits(Message, _React$Component5);

    function Message() {
        _classCallCheck(this, Message);

        return _possibleConstructorReturn(this, (Message.__proto__ || Object.getPrototypeOf(Message)).apply(this, arguments));
    }

    _createClass(Message, [{
        key: 'render',
        value: function render() {
            if (this.props.message.type === 'notification' || this.props.message.type === 'warning') {
                var datestring = moment().format("H:mm, dddd, MMM Do YYYY");
                var className = this.props.message.type === 'notification' ? 'message-notification' : 'message-warning';
                return _react2.default.createElement(
                    'li',
                    { className: className },
                    _react2.default.createElement(
                        'p',
                        { className: 'messageDate' },
                        datestring
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        this.props.message.content
                    )
                );
            } else if (this.props.message.type === 'join' || this.props.message.type === 'part') {
                var action = this.props.message.type == 'join' ? "joined" : "left";
                var date = this.props.message.type == 'join' ? moment(this.props.message.join_date) : moment();
                var _datestring = date.format("H:mm, dddd, MMM Do YYYY");
                return _react2.default.createElement(
                    'li',
                    { className: 'message-notification' },
                    _react2.default.createElement(
                        'p',
                        { className: 'messageDate' },
                        _datestring
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        this.props.message.user.username,
                        ' has ',
                        action,
                        ' the channel.'
                    )
                );
            } else {
                var _datestring2 = moment(this.props.message.timestamp + "+02:00").format("H:mm, dddd, MMM Do YYYY");
                return _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'p',
                        { className: 'messageDate' },
                        _datestring2
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement(
                            'b',
                            null,
                            this.props.message.user.username,
                            ':'
                        ),
                        ' ',
                        this.props.message.content
                    )
                );
            }
        }
    }]);

    return Message;
}(_react2.default.Component);

var MessageList = function (_React$Component6) {
    _inherits(MessageList, _React$Component6);

    function MessageList(props) {
        _classCallCheck(this, MessageList);

        var _this10 = _possibleConstructorReturn(this, (MessageList.__proto__ || Object.getPrototypeOf(MessageList)).call(this, props));

        _this10.state = {
            value: ''
        };
        _this10.handleChange = _this10.handleChange.bind(_this10);
        _this10.handleKeyPress = _this10.handleKeyPress.bind(_this10);
        return _this10;
    }

    _createClass(MessageList, [{
        key: 'handleKeyPress',
        value: function handleKeyPress(event) {
            if (event.key === 'Enter') {
                if (!/^ *$/.test(this.state.value)) {
                    var tokens = this.state.value.split(/ +/);
                    if (tokens[0] == "/join" || tokens[0] == "/j") {
                        this.props.joinChannel(tokens[1]);
                    } else if (tokens[0] == "/part" || tokens[0] == "/p") {
                        this.props.partChannel(tokens[1]);
                    } else {
                        this.props.sendMessage(this.state.value);
                    }
                    this.setState({ value: '' });
                }
                event.preventDefault();
            }
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            this.setState({
                value: event.target.value
            });
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate() {
            this.shouldScrollBottom = this.messageList.scrollTop + this.messageList.offsetHeight === this.messageList.scrollHeight;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.shouldScrollBottom) {
                this.messageList.scrollTop = this.messageList.scrollHeight;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            var items = this.props.messages.map(function (message) {
                return _react2.default.createElement(Message, { message: message });
            });

            return _react2.default.createElement(
                'div',
                { className: 'messageContainer' },
                _react2.default.createElement(
                    'ul',
                    { className: 'messageList', ref: function ref(element) {
                            _this11.messageList = element;
                        } },
                    items
                ),
                _react2.default.createElement('textarea', { rows: '2', id: 'message', onKeyPress: this.handleKeyPress, onChange: this.handleChange, value: this.state.value, className: 'form-control' })
            );
        }
    }]);

    return MessageList;
}(_react2.default.Component);

var App = function (_React$Component7) {
    _inherits(App, _React$Component7);

    function App(props) {
        _classCallCheck(this, App);

        var _this12 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this12.state = {
            selectedChannel: -1,
            user: _this12.props.user,
            channels: {},
            messages: {},
            users: {},
            new_messages: {}
        };

        API.getContext().then(function (model) {
            _this12.setState({
                channels: model.channels,
                messages: model.messages,
                users: model.users,
                new_messages: model.new_messages,
                selectedChannel: Object.keys(model.channels).length > 0 ? Object.keys(model.channels)[0] : -1
            });
        });

        _this12.ws = new WebSocket("ws://localhost:8000/ws/");

        _this12.ws.onmessage = function (message) {
            var data = JSON.parse(message.data);
            this.state.messages[data.channel.name].push(data);
            if (data.type === 'join') {
                console.log(data);
                this.state.users[data.channel.name].push(data.user);
            }if (data.type === 'part') {
                this.state.users[data.channel.name] = this.state.users[data.channel.name].filter(function (user) {
                    return user.id !== data.user.id;
                });
            }
            if (this.state.selectedChannel != data.channel.name) {
                this.state.new_messages[data.channel.name] = true;
            } else {
                this.ws.send(JSON.stringify({
                    type: 'checkMessages',
                    channelName: data.channel.name
                }));
            }

            this.forceUpdate();
        }.bind(_this12);

        _this12.updateModel = _this12.updateModel.bind(_this12);
        _this12.updateUser = _this12.updateUser.bind(_this12);
        _this12.sendMessage = _this12.sendMessage.bind(_this12);
        _this12.selectChannel = _this12.selectChannel.bind(_this12);
        _this12.joinChannel = _this12.joinChannel.bind(_this12);
        _this12.partChannel = _this12.partChannel.bind(_this12);
        return _this12;
    }

    _createClass(App, [{
        key: 'updateModel',
        value: function updateModel(data) {
            this.setState(data);
        }
    }, {
        key: 'sendMessage',
        value: function sendMessage(content) {
            API.sendMessage(this.state.channels[this.state.selectedChannel].channel.name, content);
        }
    }, {
        key: 'updateUser',
        value: function updateUser(data) {
            this.setState({
                user: data
            });
        }
    }, {
        key: 'selectChannel',
        value: function selectChannel(channel) {
            delete this.state.new_messages[channel.name];

            this.setState({
                selectedChannel: channel.name
            });
            this.ws.send(JSON.stringify({
                type: 'checkMessages',
                channelName: channel.name
            }));
        }
    }, {
        key: 'partChannel',
        value: function partChannel(channelName) {
            channelName = /^#.*/.test(channelName) ? channelName.slice(1) : channelName;

            if (this.state.channels[channelName]) {
                API.partChannel(channelName);
                delete this.state.channels[channelName];
                delete this.state.messages[channelName];
                delete this.state.users[channelName];
                if (this.state.selectedChannel === channelName) {
                    this.setState({
                        selectedChannel: Object.keys(this.state.channels).length > 0 ? Object.keys(this.state.channels)[0] : -1
                    });
                } else {
                    this.forceUpdate();
                }
            } else {
                this.state.messages[this.state.selectedChannel].push({
                    type: "warning",
                    content: "To part #" + channelName + ", you should join it first :)"
                });
                this.forceUpdate();
            }
        }
    }, {
        key: 'joinChannel',
        value: function joinChannel(channelName) {
            var _this13 = this;

            channelName = /^#.*/.test(channelName) ? channelName.slice(1) : channelName;

            if (!this.state.channels[channelName]) {
                var regex = /^[a-zA-Z0-9_-]+$/;
                if (!regex.test(channelName)) {
                    this.state.messages[this.state.selectedChannel].push({
                        type: "warning",
                        content: "Invalid channel name '" + channelName + "' given. Channel names can only contain letters from A to Z, numbers, undescores ( _ ), and hyphens ( - )."
                    });
                    this.forceUpdate();
                } else {
                    API.joinChannel(channelName).then(function (channel) {
                        _this13.state.channels[channel.channel.name] = channel;
                        _this13.state.messages[channel.channel.name] = [{
                            type: "notification",
                            content: "Welcome to #" + channelName + "!"
                        }];
                        _this13.state.users[channel.channel.name] = [];
                        API.getUsersOnChannel(channel.channel.name).then(function (users) {
                            _this13.state.users[channel.channel.name] = users;
                            _this13.forceUpdate();
                        });
                        _this13.setState({ selectedChannel: channel.channel.name });
                    });
                }
            } else {
                this.state.messages[this.state.selectedChannel].push({
                    type: "warning",
                    content: "You're allready on #" + channelName + "."
                });
                this.forceUpdate();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var users = this.state.selectedChannel === -1 ? [] : this.state.users[this.state.selectedChannel];
            var messages = this.state.selectedChannel === -1 ? [] : this.state.messages[this.state.selectedChannel];

            return _react2.default.createElement(
                'div',
                { className: 'maxHeight' },
                this.state.user.new_user && _react2.default.createElement(WelcomeScreen, { user: this.state.user, updateUser: this.updateUser }),
                _react2.default.createElement(
                    'div',
                    { className: 'container' },
                    _react2.default.createElement(
                        'div',
                        { className: 'row equal' },
                        _react2.default.createElement(
                            'div',
                            { className: 'col-lg-2' },
                            _react2.default.createElement(ChannelList, { channels: this.state.channels, selectedChannel: this.state.selectedChannel, onClick: this.selectChannel, new_messages: this.state.new_messages })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'col-lg-8' },
                            _react2.default.createElement(MessageList, { messages: messages, sendMessage: this.sendMessage, partChannel: this.partChannel, joinChannel: this.joinChannel })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'col-lg-2' },
                            _react2.default.createElement(UserList, { users: users })
                        )
                    )
                )
            );
        }
    }]);

    return App;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(App, { user: user }), document.getElementById('root'));
