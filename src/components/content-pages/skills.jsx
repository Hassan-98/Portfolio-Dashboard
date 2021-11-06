import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { showLoader, hideLoader } from "../loader.jsx";

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const nameInput = useRef();
    const logoInput = useRef();

    const getSkills = async () => {
        const { data } = await axios.get('/api/skills');
        setSkills(data)
    }

    useEffect(() => {
        getSkills();
    }, []);

    const goBack = () => {
        setAddEditMode(false);
        setEditMode(false);
    }

    const setupEditSkill = (ID) => {
        setAddEditMode(true);
        setEditMode({ID});
        const Skill = skills.find(stat => stat._id === ID);

        setTimeout(() => {
            nameInput.current.value = Skill.name;
        }, 0);
    }

    const deleteSkill = (ID) => {
        Swal.fire({
            title: 'Do you want to delete this skill?',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { data } = await axios.delete(`/api/skills?id=${ID}`);
                if (data === "Deleted") {
                    getSkills();
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
        const Skill = {
            name: nameInput.current.value,
        };

        var logo = logoInput.current.files[0];

        if (Skill.name === "") {
            hideLoader();
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Empty Fileds"
            });
        }
        
        const formdata = new FormData();
        formdata.set('name', Skill.name);

        if (logo) formdata.append('logo', logo);

        const {data} = await axios.patch(`/api/skills?id=${ID}`, formdata)
        if (data._id) {
            getSkills();
            Swal.fire('Skill Edited Successfully!', '', 'success');
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
        const Skill = {
            name: nameInput.current.value,
        };

        var logo = logoInput.current.files[0];

        if (Skill.name === "" || !logo) {
            hideLoader();
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Empty Fileds"
            });
        }
        
        const formdata = new FormData();
        formdata.set('name', Skill.name);
        formdata.append('logo', logo);

        const {data} = await axios.post(`/api/skills`, formdata)
        if (data._id) {
            getSkills();
            Swal.fire('Skill Added Successfully!', '', 'success');
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
    <section className="skills-settings">
      <div className="container">
        <h2>Skills</h2>
        <hr /> 
        {
            !addEditMode && (
                <div className="nav">
                    <button onClick={() => setAddEditMode(true)}><i className="fal fa-plus-square me-1" /> Add New Skill</button>
                </div>
            )
        }
                
        {
            !addEditMode ? (
                <div className="current">
                    <table>
                        <tbody>
                            <tr>
                                <th>#</th>
                                <th>Logo</th>
                                <th>Name</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                            {
                                skills.length ? skills.map((skill, i) => (
                                    <tr key={skill._id}>
                                        <td>{i + 1}</td>
                                        <td>
                                        <img src={skill.logo} alt="logo" />
                                        </td>
                                        <td>{skill.name}</td>
                                        <td>
                                        <button className="edit" onClick={() => setupEditSkill(skill._id)}>
                                            <i className="fas fa-edit" />
                                        </button>
                                        </td>
                                        <td>
                                        <button className="del" onClick={() => deleteSkill(skill._id)}>
                                            <i className="fas fa-trash-alt" />
                                        </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6">No Skills Yet</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>

            )
            :
            (
                <div className="editMode">
                    <button className="back" onClick={goBack}>
                        <i className="fas fa-long-arrow-alt-left" />
                    </button>
                    <h3>{editMode ? "Edit" : "Add"} Skill</h3>
                    <label>Skill Name</label>
                    <input ref={nameInput} type="text" placeholder="Skill Name" />
                    <label>Skill Logo</label>
                    <input ref={logoInput} type="file" className="logo" />
                    {
                        editMode ? <button onClick={edit}>Edit</button> : <button onClick={add}>Save</button>
                    }
                </div>
            )
        }


      </div>
    </section>
  );
};

export default Skills;
