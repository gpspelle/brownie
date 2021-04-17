import logo from './logo.svg';
import { useState } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import './App.css';
import React from 'react';

function App() {
  const [loged, setLoged] = useState(false);
  const [user, setUser] = useState();

  const handleLogin = async googleData => {  
    const res = await fetch("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({
        token: googleData.tokenId
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }) 
    const data = await res.json()
  
    if(data.message === "Loged in successfully") {
      setLoged(true);
      setUser(user);
    }
  }
  
  const handleLogout = async () => {  
    const res = await fetch("/api/v1/auth/logout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    }) 
    const data = await res.json()
  
    if(data.message === "Loged out successfully") {
      setLoged(false);
      setUser({});
    }
  } 
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        {!loged ?
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
            buttonText="Log in with Google"
            onSuccess={handleLogin}
            onFailure={handleLogin}
            cookiePolicy={'single_host_origin'}
          />
        :
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={handleLogout}
          />        
        }
      </header>
    </div>
  );
}

export default App;
