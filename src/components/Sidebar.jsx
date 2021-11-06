import React from 'react';
import { NavLink } from "react-router-dom";
import { useLocalStorage } from "react-recipes";
import Swal from "sweetalert2";

const Sidebar = ({openedSidebar, mobileView, setOpenedSidebar, setOpenedSection}) => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage('HASSAN-PORTFOLIO-ADMIN-USER');

    const hideSidebar = () => {
        setOpenedSidebar(false);
    }

    const logout = () => {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Logout!'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire(
                'Loggedout!',
                "You've been logged out.",
                'success'
              ).then(() => {
                setLoggedInUser(null);
                window.location.reload();
              })
            }
          })
    }

    return (
        <aside className={(!openedSidebar && mobileView) ? "hide sidebar col-xl-2 col-lg-3 col-md-4 col-12" : "sidebar col-xl-2 col-lg-3 col-md-4 col-12"}>
            <div className="divv">
                <section className="top">
                    {
                        mobileView && <i className="fas fa-times-circle close" onClick={hideSidebar} />
                    }
                    <img src="/logoH.png" alt="logo" />
                    <h5>Welcome Admin!</h5>
                </section>
                <section className="menu">
                    <ul>
                        <li>
                            <NavLink exact to="/" onClick={hideSidebar}>
                                <i className="fal fa-cog" /> General
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/portfolio" onClick={hideSidebar}>
                                <i className="fal fa-image-polaroid"></i>
                                Portfolio
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/skills" onClick={hideSidebar}>
                                <i className="fal fa-star" />
                                Skills
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/certs" onClick={hideSidebar}>
                                <i className="fal fa-certificate" />
                                Certificates
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/clients" onClick={hideSidebar}>
                                <i className="fal fa-users" /> 
                                Clients
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/stats" onClick={hideSidebar}>
                                <i className="far fa-sort-amount-up"></i>
                                Statstics
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/experience" onClick={hideSidebar}>
                                <i className="fal fa-briefcase"></i>
                                Experience
                            </NavLink>
                        </li>
                        <li>
                            <NavLink exact to="/contact" onClick={hideSidebar}>
                                <i className="fal fa-address-card" /> 
                                Contact
                            </NavLink>
                        </li>
                        <li>
                            <button onClick={logout}><i className="fal fa-sign-out-alt" /> 
                                Logout
                            </button>
                        </li>
                    </ul>
                </section>
            </div>
        </aside>
    )
}

export default Sidebar
