import React from 'react';
import ReactDOM from 'react-dom';

const initializeFB = require('../src/initialize_fb.js').initialize;
const moment = require('moment');
const API = require('../src/api.js');


function get_picture_url(user, width, height) {
    return new Promise(function (resolve) {
        FB.api(user.facebook_id + '/picture', 'get', {width: width, height:height}, (resp) => {
            resolve(resp.data.url)
        })
    });
}


class WelcomeScreen extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            image_loaded : false,
            error : "",
            value : ""
        };

        initializeFB.then(() => {
            get_picture_url(this.props.user, 150, 150).then(url => {
                this.image_url = url;

                this.setState({
                    image_loaded : true
                })
            });
        });

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(event){
        event.preventDefault();
        API.changeUsername(this.state.value).then((response)=>{
            if(response.error){
                this.setState({error: 'The username is already taken!'});
            } else{
                this.props.updateUser(response)
            }
        })
    }

    handleChange(event){
        this.setState({
            value: event.target.value,
            error: ''
        });
    }


    render(){
        var image = <div></div>;

        if(this.state.image_loaded) {
            image = <img src={this.image_url} alt="Profile picture"/>
        }

        return (
            <div className="usernameSelectionBackground">
              <div className="usernameSelection">
                  <h3>Welcome, {this.props.user.first_name}!</h3>
                  <div className="imageContainer">{image}</div>
                  <p>Choose your username:</p>

                  <form onSubmit={this.handleSubmit} className="form-group">
                      <input type="text" value={this.state.value} onChange={this.handleChange} className="form-control"/>
                      <input type="submit" value="Submit" className="form-control"/>
                      <p>{this.state.error}</p>
                  </form>
              </div>
            </div>
        )
    }
}
class ChannelListItem extends React.Component{

    constructor(props){
        super(props);

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(){
        this.props.onClick(this.props.channel)
    }

    render(){
        var className = "channelListItem";
        if (this.props.new_messages) className = "channelListItem-new-messages";
        if (this.props.channel.name === this.props.selectedChannel) className = "channelListItem-selected";

        return(
            <li className={className} key={this.props.channel.name} onClick={this.handleClick} id={this.props.channel.name}>#{this.props.channel.name}</li>
        )
    }

}

class Hideable extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            display: true
        };
        this.toggleVisibility = this.toggleVisibility.bind(this)
    }

    toggleVisibility(){
        this.setState({
            display: !this.state.display
        })
    }
}


class ChannelList extends Hideable{

    render(){
        const items = Object.values(this.props.channels).map(channel =>
            <ChannelListItem channel={channel.channel} selectedChannel={this.props.selectedChannel} onClick={this.props.onClick} new_messages={this.props.new_messages[channel.channel.name]}/>
        );

        return(
            <div className="channelList">
                <div className="titleBar">
                    <h4>Channels</h4>
                    <span className="hidden-lg-up"> <button type="button" className="hideButton" onClick={this.toggleVisibility}>{this.state.display ? "Hide" : "Show"}</button> </span>
               </div>

                {this.state.display && <ul>{items}</ul> }
            </div>
        )
    }
}

class UserListItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            image_loaded : false
        };

        initializeFB.then(() => {
            get_picture_url(this.props.user, 50, 50).then(url => {
                this.image_url = url;

                this.setState({
                    image_loaded : true
                })
            });
        });
    }

    render(){
        var image = <span></span>;

        if(this.state.image_loaded) {
            image = <img src={this.image_url} alt="Profile picture"/>
        }

        return <li className="userListItem" key={this.props.user.username}>
            <div className="userListItem-image-container">{image}</div>
            <div className="userListItemElement">
                <div> <b>{this.props.user.username}</b></div>
                <div> <i>{this.props.user.first_name}</i> </div>
            </div>
        </li>
    }
}


class UserList extends Hideable{

    render(){
       const items = this.props.users.map((user) =>
           <UserListItem user={user} />
       );
       return(
           <div className="userList">
               <div className="titleBar">
                    <h4>Users</h4>
                    <span className="hidden-lg-up"> <button type="button" className="hideButton" onClick={this.toggleVisibility}>{this.state.display ? "Hide" : "Show"}</button> </span>
               </div>

               {this.state.display && <ul>{items}</ul>}
           </div>
       )
    }
}
class Message extends React.Component{

    render(){
        if (this.props.message.type === 'notification' ||this.props.message.type === 'warning'){
            const datestring = moment().format("H:mm, dddd, MMM Do YYYY");
            const className = this.props.message.type === 'notification' ? 'message-notification' : 'message-warning';
            return (
                <li className={className}>
                    <p className="messageDate">{datestring}</p>
                    <p>{this.props.message.content}</p>
                </li>
            )
        }else if (this.props.message.type === 'join' || this.props.message.type === 'part'){
            const action = this.props.message.type == 'join' ? "joined" : "left";
            const date = this.props.message.type == 'join' ? moment(this.props.message.join_date) : moment();
            const datestring = date.format("H:mm, dddd, MMM Do YYYY");
            return (
                <li className="message-notification">
                    <p className="messageDate">{datestring}</p>
                    <p>{this.props.message.user.username} has {action} the channel.</p>
                </li>
            )
        } else{
            const datestring = moment(this.props.message.timestamp + "+02:00").format("H:mm, dddd, MMM Do YYYY");
            return(
                <li>
                    <p className="messageDate">{datestring}</p>
                    <p><b>{this.props.message.user.username}:</b> {this.props.message.content}</p>
                </li>
            )
        }
    }
}


class MessageList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress(event){
        if(event.key === 'Enter' ){
            if(!/^ *$/.test(this.state.value)) {
                var tokens = this.state.value.split(/ +/);
                if (tokens[0] == "/join" || tokens[0] == "/j") {
                    this.props.joinChannel(tokens[1])
                } else if (tokens[0] == "/part" || tokens[0] == "/p") {
                    this.props.partChannel(tokens[1])
                } else {
                    this.props.sendMessage(this.state.value);
                }
                this.setState({value: ''});
            }
            event.preventDefault();
        }
    }

    handleChange(event){
        this.setState({
            value: event.target.value
        })
    }

    componentWillUpdate() {
        this.shouldScrollBottom = this.messageList.scrollTop + this.messageList.offsetHeight === this.messageList.scrollHeight;
    }

    componentDidUpdate() {
        if (this.shouldScrollBottom) {
            this.messageList.scrollTop = this.messageList.scrollHeight
        }
    }

    render(){
        const items = this.props.messages.map((message) => {
           return <Message message={message} />
       });

        return(
            <div className="messageContainer">
                <ul className="messageList" ref={(element) => {this.messageList = element; }}>
                    {items}
                </ul>

                <textarea rows="2" id="message" onKeyPress={this.handleKeyPress} onChange={this.handleChange} value={this.state.value} className="form-control"/>

            </div>

        )
    }
}


class App extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            selectedChannel: -1,
            user: this.props.user,
            channels: {},
            messages: {},
            users: {},
            new_messages: {}
        };

        API.getContext().then((model)=> {
            this.setState({
                channels: model.channels,
                messages: model.messages,
                users: model.users,
                new_messages: model.new_messages,
                selectedChannel : Object.keys(model.channels).length > 0 ?  Object.keys(model.channels)[0] : -1
            });
        });

        this.ws = new WebSocket("ws://localhost:8000/ws/");



        this.ws.onmessage = function (message) {
            const data = JSON.parse(message.data);
            this.state.messages[data.channel.name].push(data);
            if(data.type === 'join'){
                console.log(data);
                this.state.users[data.channel.name].push(data.user)
            } if (data.type === 'part'){
                this.state.users[data.channel.name] = this.state.users[data.channel.name].filter(user => user.id !== data.user.id)
            }
            if(this.state.selectedChannel != data.channel.name){
                this.state.new_messages[data.channel.name] = true
            } else{
                this.ws.send(JSON.stringify({
                    type:'checkMessages',
                    channelName: data.channel.name
                }))
            }

            this.forceUpdate()
        }.bind(this);


        this.updateModel = this.updateModel.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.selectChannel = this.selectChannel.bind(this);
        this.joinChannel = this.joinChannel.bind(this);
        this.partChannel = this.partChannel.bind(this)
    }

    updateModel(data){
        this.setState(data);
    }

    sendMessage(content){
        API.sendMessage(this.state.channels[this.state.selectedChannel].channel.name, content)
    }

    updateUser(data){
        this.setState({
            user : data
        });
    }

    selectChannel(channel){
        delete this.state.new_messages[channel.name]

        this.setState({
            selectedChannel: channel.name
        });
        this.ws.send(JSON.stringify({
            type:'checkMessages',
            channelName: channel.name
        }))
    }

    partChannel(channelName){
        channelName = /^#.*/.test(channelName)? channelName.slice(1) : channelName;

        if (this.state.channels[channelName]) {
            API.partChannel(channelName);
            delete this.state.channels[channelName];
            delete this.state.messages[channelName];
            delete this.state.users[channelName];
            if (this.state.selectedChannel === channelName) {
                this.setState({
                    selectedChannel: Object.keys(this.state.channels).length > 0 ? Object.keys(this.state.channels)[0] : -1
                })
            } else {
                this.forceUpdate()
            }
        } else{
            this.state.messages[this.state.selectedChannel].push({
                type: "warning",
                content: "To part #"+ channelName +", you should join it first :)"
            });
            this.forceUpdate()
        }
    }

    joinChannel(channelName){
        channelName = /^#.*/.test(channelName)? channelName.slice(1) : channelName;

        if(!this.state.channels[channelName]) {
            const regex = /^[a-zA-Z0-9_-]+$/;
            if(!regex.test(channelName)){
                this.state.messages[this.state.selectedChannel].push({
                    type: "warning",
                    content: "Invalid channel name '"+ channelName +"' given. Channel names can only contain letters from A to Z, numbers, undescores ( _ ), and hyphens ( - )."
                });
                this.forceUpdate()
            } else {
                API.joinChannel(channelName).then(channel => {
                    this.state.channels[channel.channel.name] = channel;
                    this.state.messages[channel.channel.name] = [{
                        type: "notification",
                        content: "Welcome to #" + channelName + "!"
                    }];
                    this.state.users[channel.channel.name] = [];
                    API.getUsersOnChannel(channel.channel.name).then(users => {
                        this.state.users[channel.channel.name] = users;
                        this.forceUpdate()
                    });
                    this.setState({selectedChannel: channel.channel.name})
                })
            }
        } else{
            this.state.messages[this.state.selectedChannel].push({
                type: "warning",
                content: "You're allready on #"+ channelName +"."
            });
            this.forceUpdate()
        }
    }

    render(){
        const users = this.state.selectedChannel === -1 ? [] : this.state.users[this.state.selectedChannel]  ;
        const messages = this.state.selectedChannel === -1 ? [] : this.state.messages[this.state.selectedChannel];

        return (
            <div className="maxHeight">
                { this.state.user.new_user && <WelcomeScreen user={this.state.user} updateUser={this.updateUser}/>}
                <div className="container">
                    <div className="row equal">
                        <div className="col-lg-2"><ChannelList channels={this.state.channels} selectedChannel={this.state.selectedChannel} onClick={this.selectChannel} new_messages={this.state.new_messages}/></div>
                        <div className="col-lg-8"><MessageList messages={messages} sendMessage={this.sendMessage} partChannel={this.partChannel} joinChannel={this.joinChannel}/></div>
                        <div className="col-lg-2"><UserList users={users}/></div>
                    </div>
                </div>
            </div>
        )
    }
}


ReactDOM.render(
    <App user={user}/>,
    document.getElementById('root')
);




