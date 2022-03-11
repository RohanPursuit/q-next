import logo from './logo.svg';
import './App.css';
import {Routes, Route} from "react-router-dom"
import SignIn from './Components/SignIn';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<SignIn/>}/>
        <Route path="/player" element={<h1>Q-NEXT Player</h1>}/>
        <Route path="/room/:roomId" element={<h1>Q-NEXT Request</h1>}/>
      </Routes>
    </div>
  );
}

export default App;
