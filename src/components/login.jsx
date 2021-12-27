import { useRef } from 'react'
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import axios from "../axios/axios.js";

const Login = () => {
  const history = useHistory();
    const dispatch = useDispatch();
    const [_, setCookie] = useCookies(['portfolioCurrentAdmin']);
    const emailInput = useRef();
    const passwordInput = useRef();

    const auth = async (e) => {
      // Disabled Button & Replace it's Text With Loading
      e.target.innerHTML = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
      e.target.disabled = true;

      const email = emailInput.current.value;
      const password = passwordInput.current.value;

      if (email === "" || password === "") {
        // Enable Button & Restore it's Text
        e.target.innerHTML = `LOGIN`;
        e.target.disabled = false;
        // Show Error Message
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'All fields required!'
        })
      }

      // Sending Login Request
      const { data: {err, success} } = await axios.post('/api/auth', {email, password});

      if (err) {
        // Enable Button & Restore it's Text
        e.target.innerHTML = `LOGIN`;
        e.target.disabled = false;
        // Show Error Message
        return Swal.fire({ icon: 'error', title: err })
      } 

      // Enable Button & Restore it's Text
      e.target.innerHTML = `LOGIN`;
      e.target.disabled = false;

      // Show Success Message
      await Swal.fire({
        icon: 'success',
        title: 'Logged In',
        text: `Welcome Back, ${success.admin.username}!`
      });

      dispatch({
        type: "SET_USER_DATA",
        user: success.admin
      })

      // Save Login Token To Cookies
      setCookie('portfolioCurrentAdmin', success.token, {expires: new Date(new Date().getTime() + 6 * 60 * 60 * 1000)});

      // Redirect To Home Page
      history.go("/");
    }

    return (
        <section className="login">
            <img src="/logoH.png" alt="" />
            <h1>Login</h1>
            <input ref={emailInput} type="text" placeholder="Email address" />
            <input ref={passwordInput} type="password" placeholder="Password" />
            <button onClick={auth}>LOGIN</button>
        </section>
    );
}

export default Login;
