import * as React from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import TokenProcessor from './TokenProcessor';
import Layout from "./Layout";
import Apis from "./Apis";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route exact path='/' element={<Apis />} />
            <Route path='/apis' element={<Apis />} />
            <Route path='/publisher/token' element={<TokenProcessor />} />
            {/* Using path="*"" means "match anything", so this route
                    acts like a catch-all for URLs that we don't have explicit
                    routes for. */}
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}


function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}