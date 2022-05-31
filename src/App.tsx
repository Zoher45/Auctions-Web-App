import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import Auctions from "./components/Auctions";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import EditProfile from "./components/EditProfile";
import IndividualAuction from "./components/IndividualAuction";
import EditAuction from "./components/EditAuction";
import MyAuctionPage from "./components/MyAuctionPage";
import CreateAuction from "./components/CreateAuctions";
function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="/register" element={<Register/>}/>
              <Route path="/" element={<Auctions/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/account" element={<UserProfile/>}/>
              <Route path="/editProfile" element={<EditProfile/>}/>
              <Route path="/auction/:id" element={<IndividualAuction/>}/>
              <Route path="/edit/:id" element={<EditAuction/>}/>
              <Route path="/myAuction" element={<MyAuctionPage/>}/>
              <Route path="/createAuction" element={<CreateAuction/>}/>


              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}
export default App;