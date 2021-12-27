import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from 'react-cookie';
import { BrowserRouter, Route, Redirect } from "react-router-dom"
import axios from "./axios/axios.js";
import Login from "./components/login.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Loading from "./components/loading";
import RequestsLoader from "./components/loader";
import './assets/scss/reset.scss';
import './assets/scss/mixins.scss';
import './assets/scss/variables.scss';
import './assets/scss/main.scss';

const App = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentUser);
  const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async (token) => {
      const { data: {err, success: user} } = await axios.post('/api/auth/validateToken', {token});
  
      if (err) return setAuthenticated(false);
  
      dispatch({ type: "SET_USER_DATA", user })
      
      setAuthenticated(true);
      setLoading(false);
    }
    
    // Already Authenticated & currentUser is saved
    if (currentUser) return setLoading(false);

    // if Authenticated Validate User Token
    if (token && token !== 'null') validateToken(token);
    // if not Authenticated
    else {
      setAuthenticated(false);
      setLoading(false);
    }
  }, [currentUser, dispatch, token]);

  return (
    <div className="App">
      {
        loading ?
        <Loading />
        : 
        <div className="admin">
          <BrowserRouter>
            <Route path="/" component={AdminPanel}>
                { !authenticated && <Redirect to="/login" /> }
            </Route>
  
            <Route path="/login" exact component={Login}>
                { authenticated && <Redirect to="/" /> }
            </Route>
          </BrowserRouter>
          <RequestsLoader />
        </div>
      }
    </div>
  );
}

export default App;
