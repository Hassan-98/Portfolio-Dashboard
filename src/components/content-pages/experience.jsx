import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { useCookies } from 'react-cookie';
import { showLoader, hideLoader } from "../loader.jsx";
import { createAuthHeaders } from "../../utils/headers";

const Experience = () => {
  const [exps, setExps] = useState([]);
  const [addEditMode, setAddEditMode] = useState(false);
  const [dragAllowed, setDragAllowed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
  const nameInput = useRef();
  const detailsInput = useRef();
  const dateFromInput = useRef();
  const dateToInput = useRef();
  const typeInput = useRef();

  const getExps = async () => {
    const { data: {err, success} } = await axios.get("/api/exps");

    if (err) return;

    setExps(success);
  };

  useEffect(() => {
    getExps();
  }, []);

  const goBack = () => {
    setAddEditMode(false);
    setEditMode(false);
  };

  const setupEditExp = (ID) => {
    setAddEditMode(true);
    setEditMode({ ID });
    const Experince = exps.find((client) => client._id === ID);

    setTimeout(() => {
      nameInput.current.value = Experince.name;
      detailsInput.current.value = Experince.details;
      dateFromInput.current.value = Experince.dateFrom;
      dateToInput.current.value = Experince.dateTo;
      typeInput.current.value = Experince.type;
    }, 0);
  };

  const deleteExp = (ID) => {
    Swal.fire({
      title: "Do you want to delete this experince?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { data: {err} } = await axios.delete(`/api/exps?id=${ID}`, createAuthHeaders(token));

        if (err) return Swal.fire({ icon: 'error', title: err });

        getExps();

        Swal.fire('Deleted!', '', 'success');
      }
    });
  };

  const edit = async () => {
    const { ID } = editMode;
    showLoader();
    const Experince = {
      name: nameInput.current.value,
      details: detailsInput.current.value,
      dateFrom: dateFromInput.current.value,
      dateTo: dateToInput.current.value,
      type: typeInput.current.value,
    };

    if (
      Experince.name === "" ||
      Experince.details === "" ||
      Experince.dateFrom === "" ||
      Experince.dateTo === "" ||
      Experince.type === ""
    ) {
      hideLoader();
      return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
    }

    const { data: {err} } = await axios.patch(`/api/exps?id=${ID}`, Experince, createAuthHeaders(token));
        
    if (err) {
        hideLoader();
        return Swal.fire({ icon: 'error', title: err });
    }

    getExps();

    Swal.fire("Experince edited successfully!", "", "success");

    setAddEditMode(false);

    setEditMode(false);

    hideLoader();
  };

  const add = async () => {
    showLoader();
    const Experince = {
      name: nameInput.current.value,
      details: detailsInput.current.value,
      dateFrom: dateFromInput.current.value,
      dateTo: dateToInput.current.value,
      type: typeInput.current.value,
    };

    if (
      Experince.name === "" ||
      Experince.details === "" ||
      Experince.dateFrom === "" ||
      Experince.dateTo === "" ||
      Experince.type === ""
    ) {
      hideLoader();
      return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
    }

    const { data: {err} } = await axios.post(`/api/exps`, Experince, createAuthHeaders(token));
        
    if (err) {
        hideLoader();
        return Swal.fire({ icon: 'error', title: err });
    }

    getExps();

    Swal.fire("New experince added successfully!", "", "success");

    setAddEditMode(false);

    setEditMode(false);

    hideLoader();
  };

  const handleDragStart = (e) => {
      if (!dragAllowed) return;
      e.dataTransfer.setData("exp-id", e.target.id);
  }

  const handleDrop = (e) => {
      if (!dragAllowed) return;
      const AllExps = [...exps];
      
      const draggedExpId = e.dataTransfer.getData("exp-id");
      const droppedOverExpId = e.target.closest("tr").id;

      if (draggedExpId === droppedOverExpId) return;

      const draggedExpIndex = AllExps.findIndex(exp => exp._id === draggedExpId)
      const droppedOverExpIndex = AllExps.findIndex(exp => exp._id === droppedOverExpId)
      
      const draggedExp = AllExps.find(exp => exp._id === draggedExpId)
      const droppedOverExp = AllExps.find(exp => exp._id === droppedOverExpId)
      
      /*****************************************************************************************************/
      /******************************************| Drag n Drop Logic |**************************************/
      /*****************************************************************************************************/
      // There are exps Between them
      if (draggedExpIndex !== droppedOverExpIndex + 1 && droppedOverExpIndex !== draggedExpIndex + 1) {
          if (draggedExpIndex < droppedOverExpIndex) {
              AllExps.splice(droppedOverExpIndex, 1, droppedOverExp, draggedExp);
              AllExps.splice(draggedExpIndex, 1);
          } else {
              AllExps.splice(droppedOverExpIndex, 1, draggedExp, droppedOverExp);
              AllExps.splice(draggedExpIndex + 1, 1);
          }
      } 
      // There are No exps Between them
      else {
          if (draggedExpIndex < droppedOverExpIndex) {
              AllExps.splice(droppedOverExpIndex, 1, droppedOverExp, draggedExp);
              AllExps.splice(draggedExpIndex, 1);
          } else {
              AllExps.splice(droppedOverExpIndex, 1, draggedExp, droppedOverExp);
              AllExps.splice(draggedExpIndex + 1, 1);
          }
      }

      // Handle The Change Of Priority
      const updatedExps = AllExps.map((exp, idx) => {
          exp.priority = idx + 1;
          return exp;
      });

      // Change Order In UI
      setExps(updatedExps);
  }

  const cancelOrder = () => {
      getExps();
      setDragAllowed(false);
  }

  const saveOrder = async () => {
      showLoader();

      // Save The New Order To DB
      const dataToUpdate = exps.map(({_id, priority}) => ({_id, priority}));
      
      const { data: {err} } = await axios.patch(`/api/exp/updateOrder`, dataToUpdate, createAuthHeaders(token))
        
      if (err) {
          hideLoader();
          return Swal.fire({ icon: 'error', title: err });
      }

      Swal.fire('New order saved', '', 'success');
      
      setDragAllowed(false);

      hideLoader();
  }

  return (
    <section className="exp-settings">
      <div className="container">
        <h2>Experince</h2>
        <hr />
        {!addEditMode && (
          <div className="nav">
            <button className="me-2" onClick={() => setAddEditMode(true)}>
              <i className="fal fa-plus-square me-1" /> Add New Experince
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
                  <th>From</th>
                  <th>To</th>
                  <th>Type</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
                {exps.length ? (
                  exps.map((exp) => (
                    <tr 
                      key={exp._id} 
                      draggable={dragAllowed} 
                      onDragStart={handleDragStart} 
                      onDrop={handleDrop} 
                      onDragOver={(e) => e.preventDefault()}
                      id={exp._id}
                      className={dragAllowed ? "draggable" : ""}
                    >
                      <td>#</td>
                      <td>{exp.name}</td>
                      <td>{exp.details}</td>
                      <td>{exp.dateFrom}</td>
                      <td>{exp.dateTo}</td>
                      <td>{exp.type}</td>
                      <td>
                        <button
                          className="edit"
                          onClick={() => setupEditExp(exp._id)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                      </td>
                      <td>
                        <button
                          className="del"
                          onClick={() => deleteExp(exp._id)}
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No Experinces Yet</td>
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
            <h3>{editMode ? "Edit" : "Add"} Experince</h3>
            <label>Experince Name</label>
            <input ref={nameInput} type="text" placeholder="Experince Name" />
            <label>Experince Date From</label>
            <input
              ref={dateFromInput}
              v-model="dateFrom"
              type="number"
              min="1900"
              max="2099"
              step="1"
              placeholder="Experince Date From"
            />
            <label>Experince Date To</label>
            <input
              ref={dateToInput}
              type="number"
              min="1900"
              max="2099"
              step="1"
              placeholder="Experince Date To"
            />
            <label>Experince Type</label>
            <select ref={typeInput}>
              <option value="experince">Experince</option>
              <option value="education">Education</option>
            </select>
            <label>Experince Details</label>
            <textarea ref={detailsInput} placeholder="Experince Details" />
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

export default Experience;
