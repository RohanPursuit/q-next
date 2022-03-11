import logo from './logo.svg';
import './App.css';
import {Routes, Route} from "react-router-dom"
import SignIn from './Components/SignIn';
import Player from './Pages/Player';
import Request from './Pages/Request';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<SignIn/>}/>
        <Route path="/player" element={<Player/>}/>
        <Route path="/room/:roomId" element={<Request/>}/>
      </Routes>
    </div>
  );
}

export default App;
