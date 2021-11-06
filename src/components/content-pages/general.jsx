import { useRef } from 'react';
import { useLocalStorage } from "react-recipes";
import Swal from "sweetalert2";
import axios from "../../axios/axios";

const General = () => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage('HASSAN-PORTFOLIO-ADMIN-USER');

    const usernameInput = useRef();
    const currentPasswordInput = useRef();
    const newPasswordInput = useRef();

    const changeUsername = async () => {
        const ID = loggedInUser._id;
        const {data} = await axios.patch(`/api/auth/updateAcc?id=${ID}`, {username: usernameInput.current.value})
        if (data !== 'Wrong Password') {
            delete data.password
            setLoggedInUser(data);
            Swal.fire('Done!', 'Username Changed Successfully!', 'success').then(() => {
                window.location.reload()
            })
        }

    }

    const changePassword = async () => {
        const ID = loggedInUser._id;
        let credentials = {
            oldPass: currentPasswordInput.current.value,
            newPass: newPasswordInput.current.value
        }
        const {data} = await axios.patch(`/api/auth/updateAcc?id=${ID}`, credentials);
        if (data != 'Wrong Password') {
            Swal.fire('Done!', 'Password Changed Successfully!', 'success').then(() => {
                window.location.reload()
            })
        } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data
            })
        }

    }

    return (
        <section className="general-settings">
            <div className="container">
                <h2>General Settings</h2>
                <hr />
                <div className="security">
                    <div className="inputBox">
                    <label>Change Username</label>
                    <input ref={usernameInput} type="text" placeholder="New Username" defaultValue={loggedInUser.username} />
                    <button onClick={changeUsername}>Save</button>
                    </div>
                    <hr />
                    <div className="inputBox">
                    <label>Change Password</label>
                    <input ref={currentPasswordInput} type="password" placeholder="Current Password" />
                    <input ref={newPasswordInput} type="password" placeholder="New Password" />
                    <button onClick={changePassword}>Save</button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default General
