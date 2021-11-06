import { useEffect, useState } from "react";
import { useLocalStorage } from "react-recipes";
import { BrowserRouter, Route, Redirect } from "react-router-dom"
import './assets/scss/reset.scss';
import './assets/scss/mixins.scss';
import './assets/scss/variables.scss';
import './assets/scss/main.scss';
import Login from "./components/login.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Loader from "./components/loader";

const App = () => {
  const [loggedInUser] = useLocalStorage('HASSAN-PORTFOLIO-ADMIN-USER', null);
  const [session, setSession] = useState(true);

  useEffect(() => {
    if (loggedInUser) {
      var expiresAt = new Date(loggedInUser.expiresAt).getTime()

      if (Date.now() > expiresAt) {
        setSession(false);
      }
    } else {
      setSession(false);
    }
  }, [loggedInUser]);

  return (
    <div className="App">
      <div className="admin">
          <BrowserRouter>
            <Route path="/" component={AdminPanel}>
                { (!loggedInUser || !session) && <Redirect to="/login" /> }
            </Route>

            <Route path="/login" exact component={Login}>
                { (loggedInUser && session) && <Redirect to="/" /> }
            </Route>
          </BrowserRouter>
        </div>
        <Loader />
    </div>
  );
}

export default App;
