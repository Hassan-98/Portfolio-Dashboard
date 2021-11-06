import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { showLoader, hideLoader } from "../loader.jsx";

const Experience = () => {
  const [exps, setExps] = useState([]);
  const [addEditMode, setAddEditMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const nameInput = useRef();
  const detailsInput = useRef();
  const dateFromInput = useRef();
  const dateToInput = useRef();
  const typeInput = useRef();

  const getExps = async () => {
    const { data } = await axios.get("/api/exps");
    setExps(data);
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
        const { data } = await axios.delete(`/api/exps?id=${ID}`);
        if (data === "Deleted") {
          getExps();
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
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Empty Fileds",
      });
    }

    const { data } = await axios.patch(`/api/exps?id=${ID}`, Experince);
    if (data._id) {
      getExps();
      Swal.fire("Experince Edited Successfully!", "", "success");
      setAddEditMode(false);
      setEditMode(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data,
      });
    }
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
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Empty Fileds",
      });
    }

    const { data } = await axios.post(`/api/exps`, Experince);
    if (data._id) {
      getExps();
      Swal.fire("Experince Added Successfully!", "", "success");
      setAddEditMode(false);
      setEditMode(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data,
      });
    }
    hideLoader();
  };

  return (
    <section className="exp-settings">
      <div className="container">
        <h2>Experince</h2>
        <hr />
        {!addEditMode && (
          <div className="nav">
            <button onClick={() => setAddEditMode(true)}>
              <i className="fal fa-plus-square me-1" /> Add New Experince
            </button>
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
                    <tr key={exp._id}>
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
