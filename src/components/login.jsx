import { useRef } from 'react'
import { useLocalStorage } from "react-recipes";
import Swal from "sweetalert2";
import axios from "../axios/axios.js";

const Login = () => {
    const [_, setLoggedInUser] = useLocalStorage('HASSAN-PORTFOLIO-ADMIN-USER', null);
    const usernameInput = useRef();
    const passwordInput = useRef();

    const auth = async (e) => {
      // Disabled Button & Replace it's Text With Loading
      e.target.innerHTML = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
      e.target.disabled = true;

      const username = usernameInput.current.value;
      const password = passwordInput.current.value;

      if (username !== "" && password !== "") {
        // Sending Login Request
        const { data } = await axios.post('/api/auth/signin', {username, password});
        if (data !== 'Wrong Username Or Password') {
          // Enable Button & Restore it's Text
          e.target.innerHTML = `Authenticate`;
          e.target.disabled = false;
          // Remove User Password Before Save User Data To LocalStorage
          delete data.password
          // Set A Login Session of 3 Hours
          data.expiresAt = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
          // Save User Data To LocalStorage
          setLoggedInUser(data);

          // Show Success Message
          await Swal.fire({
            icon: 'success',
            title: 'Logged In',
            text: `Welcome Back, ${data.username}!`
          })

          // Redirect To Home Page
          window.location.href = "/";
        } else {
            // Enable Button & Restore it's Text
            e.target.innerHTML = `Authenticate`;
            e.target.disabled = false;
            // Show Error Message
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Wrong Username Or Password'
            })
        }
      } else {
        // Enable Button & Restore it's Text
        e.target.innerHTML = `Authenticate`;
        e.target.disabled = false;
        // Show Error Message
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Empty Fileds!'
        })
      }
    }

    return (
        <section className="login">
            <img src="/logoH.png" alt="" />
            <h1>Login</h1>
            <input ref={usernameInput} type="text" placeholder="Username" />
            <input ref={passwordInput} type="password" placeholder="Password" />
            <button onClick={auth}>Authenticate</button>
        </section>
    )
}

export default Login;
