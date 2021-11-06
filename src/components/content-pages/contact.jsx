import { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import moment from "moment";

const Contact = () => {
    const [msgs, setMsgs] = useState([]);

    const getMessages = async () => {
        const { data } = await axios.get('/api/contact');
        setMsgs(data)
    }

    useEffect(() => {
        getMessages();
    }, []);

    const deleteMsg = async (ID) => {
        Swal.fire({
            title: 'Do you want to delete this message?',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { data } = await axios.delete(`/api/contact?id=${ID}`);
                if (data === "Deleted") {
                    getMessages();
                    Swal.fire('Deleted!', '', 'success')
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data
                    });
                }
            }
        });
    }

    return (
      <section class="contact-settings">
        <div className="container">
          <h2>Contact Form</h2>
          <hr />
          <div className="current">
            <table>
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Delete</th>
                </tr>
                {
                    msgs.length ? msgs.map(msg => (
                        <tr key={msg._id}>
                            <td>{msg.fullName}</td>
                            <td>{msg.email}</td>
                            <td>{msg.message}</td>
                            <td>{ moment(msg.date).format('DD / MM / Y - hh:mm A') }</td>
                            <td>
                                <button className="del" onClick={() => deleteMsg(msg._id)}>
                                <i className="fas fa-trash-alt" />
                                </button>
                            </td>
                        </tr>

                    )) :
                    (
                        <tr>
                            <td colSpan="5">No Messages Yet</td>
                        </tr>
                    )
                }
                
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
}

export default Contact
