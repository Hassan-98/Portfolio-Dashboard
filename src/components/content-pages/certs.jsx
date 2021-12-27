import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { useCookies } from 'react-cookie';
import { showLoader, hideLoader } from "../loader.jsx";
import { createAuthHeaders } from "../../utils/headers";

const Certs = () => {
    const [certs, setCerts] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [dragAllowed, setDragAllowed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
    const certInput = useRef();

    const getCerts = async () => {
        const { data: {err, success} } = await axios.get('/api/certs');

        if (err) return;

        setCerts(success);
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
              const { data: {err} } = await axios.delete(`/api/certs?id=${ID}`, createAuthHeaders(token));

              if (err) return Swal.fire({ icon: 'error', title: err });

              getCerts();

              Swal.fire('Deleted!', '', 'success');
            }
        });
    }

    const edit = async () => {
        const {ID} = editMode;
        showLoader();

        var cert = certInput.current.files[0];
        const formdata = new FormData();
        formdata.append('cert', cert);

        const {data: {err}} = await axios.patch(`/api/certs?id=${ID}`, formdata, createAuthHeaders(token));
        
        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }
        
        getCerts();

        Swal.fire('Certificate edited successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);
        
        hideLoader();
    }

    const add = async () => {
        showLoader();

        var cert = certInput.current.files[0];

        if (!cert) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();
        formdata.append('cert', cert);

        const {data: {err}} = await axios.post(`/api/certs`, formdata, createAuthHeaders(token));
        
        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }
        
        getCerts();

        Swal.fire('New certificate added successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    const handleDragStart = (e) => {
        if (!dragAllowed) return;
        e.dataTransfer.setData("cert-id", e.target.id);
    }

    const handleDrop = (e) => {
        if (!dragAllowed) return;
        const AllCerts = [...certs];
        
        const draggedCertId = e.dataTransfer.getData("cert-id");
        const droppedOverCertId = e.target.closest("tr").id;

        if (draggedCertId === droppedOverCertId) return;

        const draggedCertIndex = AllCerts.findIndex(cert => cert._id === draggedCertId)
        const droppedOverCertIndex = AllCerts.findIndex(cert => cert._id === droppedOverCertId)
        
        const draggedCert = AllCerts.find(cert => cert._id === draggedCertId)
        const droppedOverCert = AllCerts.find(cert => cert._id === droppedOverCertId)
        
        /*****************************************************************************************************/
        /******************************************| Drag n Drop Logic |**************************************/
        /*****************************************************************************************************/
        // There are certs Between them
        if (draggedCertIndex !== droppedOverCertIndex + 1 && droppedOverCertIndex !== draggedCertIndex + 1) {
            if (draggedCertIndex < droppedOverCertIndex) {
                AllCerts.splice(droppedOverCertIndex, 1, droppedOverCert, draggedCert);
                AllCerts.splice(draggedCertIndex, 1);
            } else {
                AllCerts.splice(droppedOverCertIndex, 1, draggedCert, droppedOverCert);
                AllCerts.splice(draggedCertIndex + 1, 1);
            }
        } 
        // There are No certs Between them
        else {
            if (draggedCertIndex < droppedOverCertIndex) {
                AllCerts.splice(droppedOverCertIndex, 1, droppedOverCert, draggedCert);
                AllCerts.splice(draggedCertIndex, 1);
            } else {
                AllCerts.splice(droppedOverCertIndex, 1, draggedCert, droppedOverCert);
                AllCerts.splice(draggedCertIndex + 1, 1);
            }
        }

        // Handle The Change Of Priority
        const updatedCerts = AllCerts.map((cert, idx) => {
            cert.priority = idx + 1;
            return cert;
        });

        // Change Order In UI
        setCerts(updatedCerts);
    }

    const cancelOrder = () => {
        getCerts();
        setDragAllowed(false);
    }

    const saveOrder = async () => {
        showLoader();

        // Save The New Order To DB
        const dataToUpdate = certs.map(({_id, priority}) => ({_id, priority}));
        
        const { data: {err} } = await axios.patch(`/api/certs/updateOrder`, dataToUpdate, createAuthHeaders(token))
        
        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        Swal.fire('New order saved', '', 'success');
        
        setDragAllowed(false);

        hideLoader();
    }
    
  return (
    <section className="certs-settings">
      <div className="container">
        <h2>Certificates</h2>
        <hr />
        {!addEditMode && (
          <div className="nav">
            <button className="me-2" onClick={() => setAddEditMode(true)}>
              <i className="fal fa-plus-square me-1" /> Add New Certificate
            </button>
            {
              dragAllowed ? 
              <>
                  <button className="saveOrder" onClick={saveOrder}><i className="fad fa-save me-1" /> Save Order</button>
                  <button className="cancelOrder" onClick={cancelOrder}><i className="fad fa-ban me-1" /> Cancel</button>
              </>
              :
              <button onClick={() => setDragAllowed(true)}><i className="fad fa-sort-size-up me-1" /> Change Order</button>
            }
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
                    <tr 
                      key={cert._id} 
                      draggable={dragAllowed} 
                      onDragStart={handleDragStart} 
                      onDrop={handleDrop} 
                      onDragOver={(e) => e.preventDefault()}
                      id={cert._id}
                      className={dragAllowed ? "draggable" : ""}
                    >
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
