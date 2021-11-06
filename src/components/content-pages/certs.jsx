import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { showLoader, hideLoader } from "../loader.jsx";

const Certs = () => {
    const [certs, setCerts] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const certInput = useRef();

    const getCerts = async () => {
        const { data } = await axios.get('/api/certs');
        setCerts(data)
    }

    useEffect(() => {
        getCerts();
    }, []);

    const goBack = () => {
        setAddEditMode(false);
        setEditMode(false);
    }

    const setupEditCert= (ID) => {
        setAddEditMode(true);
        setEditMode({ID});
    }

    const deleteCert = (ID) => {
        Swal.fire({
            title: 'Do you want to delete this Certificate?',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { data } = await axios.delete(`/api/certs?id=${ID}`);
                if (data === "Deleted") {
                    getCerts();
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

    const edit = async () => {
        const {ID} = editMode;
        showLoader();

        var cert = certInput.current.files[0];
        const formdata = new FormData();
        formdata.append('cert', cert);

        const {data} = await axios.patch(`/api/certs?id=${ID}`, formdata)
        if (data._id) {
            getCerts();
            Swal.fire('Certificate Edited Successfully!', '', 'success');
            setAddEditMode(false);
            setEditMode(false);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data
            });
        }
        hideLoader();
    }

    const add = async () => {
        showLoader();

        var cert = certInput.current.files[0];
        if (!cert) {
            hideLoader();
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Empty Fileds"
            });
        }
        
        const formdata = new FormData();
        formdata.append('cert', cert);

        const {data} = await axios.post(`/api/certs`, formdata)
        if (data._id) {
            getCerts();
            Swal.fire('Certificate Added Successfully!', '', 'success');
            setAddEditMode(false);
            setEditMode(false);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data
            });
        }
        hideLoader();
    }
    
  return (
    <section className="certs-settings">
      <div className="container">
        <h2>Certificates</h2>
        <hr />
        {!addEditMode && (
          <div className="nav">
            <button onClick={() => setAddEditMode(true)}>
              <i className="fal fa-plus-square me-1" /> Add New Certificate
            </button>
          </div>
        )}

        {!addEditMode ? (
          <div className="current">
            <table>
              <tbody>
                <tr>
                  <th>#</th>
                  <th>Certificate Image</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
                {certs.length ? (
                  certs.map((cert, i) => (
                    <tr key={cert._id}>
                      <td>{ i + 1 }</td>
                      <td>
                        <img src={cert.cert} alt="certificate" />
                      </td>
                      <td>
                        <button
                          className="edit"
                          onClick={() => setupEditCert(cert._id)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                      </td>
                      <td>
                        <button
                          className="del"
                          onClick={() => deleteCert(cert._id)}
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No Certificates Yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="editMode">
            <button className="back" onClick={goBack}>
              <i className="fas fa-long-arrow-alt-left" />
            </button>
            <h3>{editMode ? "Edit" : "Add"} Certificate</h3>
            <label>Choose Certificate Image <span className="text-muted">(PNG, JPEG)</span></label>
            <input type="file" ref={certInput} className="cert" />
            {editMode ? (
              <button onClick={edit}>Edit</button>
            ) : (
              <button onClick={add}>Save</button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Certs;
