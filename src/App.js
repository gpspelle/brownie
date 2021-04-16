import logo from './logo.svg';
import { GoogleLogin } from 'react-google-login';
import './App.css';

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
  console.log(data)
  // store returned user somehow
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
	      <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
            buttonText="Log in with Google"
            onSuccess={handleLogin}
            onFailure={handleLogin}
            cookiePolicy={'single_host_origin'}
        />
      </header>
    </div>
  );
}

export default App;
