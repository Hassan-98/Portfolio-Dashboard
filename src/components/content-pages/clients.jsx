import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { showLoader, hideLoader } from "../loader.jsx";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [addEditMode, setAddEditMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const nameInput = useRef();
  const detailsInput = useRef();
  const picInput = useRef();

  const getClients = async () => {
    const { data } = await axios.get("/api/clients");
    setClients(data);
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
        const { data } = await axios.delete(`/api/clients?id=${ID}`);
        if (data === "Deleted") {
          getClients();
          Swal.fire("Deleted!", "", "success");
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data,
          });
        }
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
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Empty Fileds"
        });
    }
    
    const formdata = new FormData();
    formdata.set('name', Client.name);
    formdata.set('details', Client.details);

    if (picture) formdata.append('picture', picture);

    const {data} = await axios.patch(`/api/clients?id=${ID}`, formdata)
    if (data._id) {
        getClients();
        Swal.fire('Client Edited Successfully!', '', 'success');
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
    const Client = {
        name: nameInput.current.value,
        details: detailsInput.current.value,
    };

    var picture = picInput.current.files[0];

    if (Client.name === "" || Client.details === "" || !picture) {
        hideLoader();
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Empty Fileds"
        });
    }
    
    const formdata = new FormData();
    formdata.set('name', Client.name);
    formdata.set('details', Client.details);
    formdata.append('picture', picture);

    const {data} = await axios.post(`/api/clients`, formdata)
    if (data._id) {
        getClients();
        Swal.fire('Client Added Successfully!', '', 'success');
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
    <section class="clients-settings">
      <div class="container">
        <h2>Clients</h2>
        <hr />
        {!addEditMode && (
          <div className="nav">
            <button onClick={() => setAddEditMode(true)}>
              <i className="fal fa-plus-square me-1" /> Add New Client
            </button>
          </div>
        )}
        {!addEditMode ? (
          <div class="current">
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
                    <tr key={client._id}>
                      <td>{ i + 1 }</td>
                      <td>{client.name}</td>
                      <td>{client.details}</td>
                      <td>
                        <img src={client.picture} alt="pic" />
                      </td>
                      <td>
                        <button class="edit" onClick={() => setupEditClient(client._id)}>
                          <i class="fas fa-edit" />
                        </button>
                      </td>
                      <td>
                        <button class="del" onClick={() => deleteClient(client._id)}>
                          <i class="fas fa-trash-alt" />
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
          <div class="editMode">
            <button class="back" onClick={goBack}>
              <i class="fas fa-long-arrow-alt-left" />
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
            <input type="file" ref={picInput} class="pic" />
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
