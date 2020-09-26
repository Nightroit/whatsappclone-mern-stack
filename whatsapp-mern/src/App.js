import React, {useEffect, useState} from 'react';
import './App.css';
import Chat from './Chat';
import Sidebar from './Sidebar';
import Pusher from 'pusher-js'
import axios from './axios'; 

function App() {  

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get('/messages/sync')
      .then((response) => {
        
        setMessages(response.data);
  
      })
  }, []);

  useEffect(() => {
    Pusher.logToConsole = true;

    const pusher = new Pusher('0ebaac0edefbb5a2867d', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (newMessage) => {
      //alert(JSON.stringify(newMessage));
      setMessages([...messages, newMessage])
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    }

  }, [messages]);

  console.log(messages);

  return (
    <div className="app">
      <div className = "app__body">
          <Sidebar />
          <Chat messages = {messages}  />
        </div>
    </div>
  );
}

export default App;

{/*<h1>Jai Shri Ram</h1>
<h1>Mahabali hanuman</h1>*/}