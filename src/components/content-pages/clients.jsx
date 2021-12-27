import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { useCookies } from 'react-cookie';
import { showLoader, hideLoader } from "../loader.jsx";
import { createAuthHeaders } from "../../utils/headers";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [addEditMode, setAddEditMode] = useState(false);
  const [dragAllowed, setDragAllowed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
  const nameInput = useRef();
  const detailsInput = useRef();
  const picInput = useRef();

  const getClients = async () => {
    const { data: {err, success} } = await axios.get("/api/clients");

    if (err) return;

    setClients(success);
  };

  useEffect(() => {
    getClients();
  }, []);

  const goBack = () => {
    setAddEditMode(false);
    setEditMode(false);
  };

  const setupEditClient = (ID) => {
    setAddEditMode(true);
    setEditMode({ ID });
    const Client = clients.find(client => client._id === ID);

    setTimeout(() => {
        nameInput.current.value = Client.name;
        detailsInput.current.value = Client.details;
    }, 0);
  };

  const deleteClient = (ID) => {
    Swal.fire({
      title: "Do you want to delete this Client?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { data: {err} } = await axios.delete(`/api/clients?id=${ID}`, createAuthHeaders(token));

        if (err) return Swal.fire({ icon: 'error', title: err });

        getClients();

        Swal.fire('Deleted!', '', 'success');
      }
    });
  };

  const edit = async () => {
    const {ID} = editMode;
    showLoader();
    const Client = {
        name: nameInput.current.value,
        details: detailsInput.current.value,
    };

    var picture = picInput.current.files[0];

    if (Client.name === "" || Client.details === "") {
        hideLoader();
        return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
    }
    
    const formdata = new FormData();
    formdata.set('name', Client.name);
    formdata.set('details', Client.details);

    if (picture) formdata.append('picture', picture);

    const {data: {err}} = await axios.patch(`/api/clients?id=${ID}`, formdata, createAuthHeaders(token));
        
    if (err) {
        hideLoader();
        return Swal.fire({ icon: 'error', title: err });
    }

    getClients();

    Swal.fire('Client edited successfully!', '', 'success');

    setAddEditMode(false);

    setEditMode(false);

    hideLoader();
  }

  const add = async () => {
    showLoader();
    const Client = {
        name: nameInput.current.value,
        details: detailsInput.current.value,
    };

    var picture = picInput.current.files[0];

    if (Client.name === "" || Client.details === "" || !picture) {
        hideLoader();
        return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
    }
    
    const formdata = new FormData();
    formdata.set('name', Client.name);
    formdata.set('details', Client.details);
    formdata.append('picture', picture);

    const {data: {err}} = await axios.post(`/api/clients`, formdata, createAuthHeaders(token));
        
    if (err) {
        hideLoader();
        return Swal.fire({ icon: 'error', title: err });
    }

    getClients();

    Swal.fire('New client added Ssuccessfully!', '', 'success');
    
    setAddEditMode(false);

    setEditMode(false);

    hideLoader();
  }

  const handleDragStart = (e) => {
      if (!dragAllowed) return;
      e.dataTransfer.setData("client-id", e.target.id);
  }

  const handleDrop = (e) => {
      if (!dragAllowed) return;
      const AllClients = [...clients];
      
      const draggedClientId = e.dataTransfer.getData("client-id");
      const droppedOverClientId = e.target.closest("tr").id;

      if (draggedClientId === droppedOverClientId) return;

      const draggedClientIndex = AllClients.findIndex(client => client._id === draggedClientId)
      const droppedOverClientIndex = AllClients.findIndex(client => client._id === droppedOverClientId)
      
      const draggedClient = AllClients.find(client => client._id === draggedClientId)
      const droppedOverClient = AllClients.find(client => client._id === droppedOverClientId)
      
      /*****************************************************************************************************/
      /******************************************| Drag n Drop Logic |**************************************/
      /*****************************************************************************************************/
      // There are clients Between them
      if (draggedClientIndex !== droppedOverClientIndex + 1 && droppedOverClientIndex !== draggedClientIndex + 1) {
          if (draggedClientIndex < droppedOverClientIndex) {
              AllClients.splice(droppedOverClientIndex, 1, droppedOverClient, draggedClient);
              AllClients.splice(draggedClientIndex, 1);
          } else {
              AllClients.splice(droppedOverClientIndex, 1, draggedClient, droppedOverClient);
              AllClients.splice(draggedClientIndex + 1, 1);
          }
      } 
      // There are No clients Between them
      else {
          if (draggedClientIndex < droppedOverClientIndex) {
              AllClients.splice(droppedOverClientIndex, 1, droppedOverClient, draggedClient);
              AllClients.splice(draggedClientIndex, 1);
          } else {
              AllClients.splice(droppedOverClientIndex, 1, draggedClient, droppedOverClient);
              AllClients.splice(draggedClientIndex + 1, 1);
          }
      }

      // Handle The Change Of Priority
      const updatedClients = AllClients.map((client, idx) => {
          client.priority = idx + 1;
          return client;
      });

      // Change Order In UI
      setClients(updatedClients);
  }

  const cancelOrder = () => {
      getClients();
      setDragAllowed(false);
  }

  const saveOrder = async () => {
      showLoader();

      // Save The New Order To DB
      const dataToUpdate = clients.map(({_id, priority}) => ({_id, priority}));
      
      const { data: {err} } = await axios.patch(`/api/clients/updateOrder`, dataToUpdate, createAuthHeaders(token))
        
      if (err) {
          hideLoader();
          return Swal.fire({ icon: 'error', title: err });
      }

      Swal.fire('New order saved', '', 'success');
      
      setDragAllowed(false);

      hideLoader();
  }

  return (
    <section className="clients-settings">
      <div className="container">
        <h2>Clients</h2>
        <hr />
        {!addEditMode && (
          <div className="nav">
            <button className="me-2" onClick={() => setAddEditMode(true)}>
              <i className="fal fa-plus-square me-1" /> Add New Client
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
                  <th>Name</th>
                  <th>Details</th>
                  <th>Picture</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
                {clients.length ? (
                  clients.map((client, i) => (
                    <tr 
                      key={client._id} 
                      draggable={dragAllowed} 
                      onDragStart={handleDragStart} 
                      onDrop={handleDrop} 
                      onDragOver={(e) => e.preventDefault()}
                      id={client._id}
                      className={dragAllowed ? "draggable" : ""}
                    >
                      <td>{ i + 1 }</td>
                      <td>{client.name}</td>
                      <td>{client.details}</td>
                      <td>
                        <img src={client.picture} alt="pic" />
                      </td>
                      <td>
                        <button className="edit" onClick={() => setupEditClient(client._id)}>
                          <i className="fas fa-edit" />
                        </button>
                      </td>
                      <td>
                        <button className="del" onClick={() => deleteClient(client._id)}>
                          <i className="fas fa-trash-alt" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No Clients Yet</td>
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
            <h3>{editMode ? "Edit" : "Add"} Client</h3>
            <label>Client Name</label>
            <input ref={nameInput} type="text" placeholder="Client Name" />
            <label>Client Details</label>
            <input
              ref={detailsInput}
              type="text"
              placeholder="Client Details"
            />
            <label>Client Picture</label>
            <input type="file" ref={picInput} className="pic" />
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

export default Clients;
