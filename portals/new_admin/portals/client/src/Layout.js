import React from 'react';
import './App.css';
import Profile from './Profile';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import { Outlet } from 'react-router-dom';

function Layout() {

  return (
    <div className="App">
      <nav className="container">
        <input id="nav-toggle" type="checkbox" />
        <div className="logo">
          WSO2 <strong style={{"color": "#153b66", fontWeight: "800"}}>API Manager</strong>
        </div>
        <ul className="links">
          <li className="list">
            <a href="">Home</a>
            <div className="home_underline"></div>
          </li>
          <li className="list">
            <a href="">Products</a>
            <div className="home_underline"></div>
          </li>
          <li className="list">
            <a href="">About</a>
            <div className="home_underline"></div>
          </li>
          <LoginButton />
          <LogoutButton />
          <Profile />
        </ul>
        <label className="icon-burger">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </label>
      </nav>
      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
          <div style={{background: '#fff', width: '100%', height: '100vh', marginTop: 150, paddingLeft: 50, paddingTop: 20}}>
              <Outlet />
          </div>
    </div>
  );
}

export default Layout;
