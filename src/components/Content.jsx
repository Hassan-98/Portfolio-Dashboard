import { useState, useEffect } from "react"
import { Route, Redirect } from "react-router-dom"
import { useLocalStorage } from "react-recipes";
import General from "./content-pages/general.jsx";
import Certs from "./content-pages/certs.jsx";
import Clients from "./content-pages/clients.jsx";
import Contact from "./content-pages/contact.jsx";
import Experience from "./content-pages/experience.jsx";
import Portfolio from "./content-pages/portfolio.jsx";
import Skills from "./content-pages/skills.jsx";
import Stats from "./content-pages/stats.jsx";
import MyPic from "../assets/images/mypic3.png"

const Content = () => {
    const [loggedInUser] = useLocalStorage('HASSAN-PORTFOLIO-ADMIN-USER');
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
        <div className="admin-content col-xl-10 col-lg-9 col-md-8 col-12">
            <nav>
                <img src={MyPic} alt="user" /> <span>{ loggedInUser && loggedInUser.username }</span>
            </nav>
            <div className="Sections">
                <Route path="/" exact component={General}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/portfolio" exact component={Portfolio}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/certs" exact component={Certs}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/clients" exact component={Clients}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/contact" exact component={Contact}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/experience" exact component={Experience}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/skills" exact component={Skills}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
                <Route path="/stats" exact component={Stats}>
                    { (!loggedInUser || !session) && <Redirect to="/login" /> }
                </Route>
            </div>
        </div>
    )
}

export default Content
