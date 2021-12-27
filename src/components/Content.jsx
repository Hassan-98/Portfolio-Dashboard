import { Route } from "react-router-dom"
import { useSelector } from "react-redux";
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
    const currentUser = useSelector(state => state.currentUser);

    return (
        <div className="admin-content col-xl-10 col-lg-9 col-md-8 col-12">
            <nav>
                <img src={MyPic} alt="user" /> <span>{ currentUser.username }</span>
            </nav>
            <div className="Sections">
                <Route path="/" exact component={General}></Route>
                <Route path="/portfolio" exact component={Portfolio}></Route>
                <Route path="/certs" exact component={Certs}></Route>
                <Route path="/clients" exact component={Clients}></Route>
                <Route path="/contact" exact component={Contact}></Route>
                <Route path="/experience" exact component={Experience}></Route>
                <Route path="/skills" exact component={Skills}></Route>
                <Route path="/stats" exact component={Stats}></Route>
            </div>
        </div>
    )
}

export default Content
