import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { useCookies } from 'react-cookie';
import { showLoader, hideLoader } from "../loader.jsx";
import { createAuthHeaders } from "../../utils/headers";

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [dragAllowed, setDragAllowed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
    const nameInput = useRef();
    const logoInput = useRef();

    const getSkills = async () => {
        const { data: {err, success} } = await axios.get('/api/skills');

        if (err) return;

        setSkills(success)
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
                const { data: {err} } = await axios.delete(`/api/skills?id=${ID}`, createAuthHeaders(token));

                if (err) return Swal.fire({ icon: 'error', title: err });

                getSkills();

                Swal.fire('Deleted!', '', 'success')
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
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();
        formdata.set('name', Skill.name);

        if (logo) formdata.append('logo', logo);

        const {data: {err}} = await axios.patch(`/api/skills?id=${ID}`, formdata, createAuthHeaders(token));
        
        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        getSkills();

        Swal.fire('Skill edited successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    const add = async () => {
        showLoader();
        
        const Skill = { name: nameInput.current.value };

        var logo = logoInput.current.files[0];

        if (Skill.name === "" || !logo) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();
        formdata.set('name', Skill.name);
        formdata.append('logo', logo);

        const { data: {err} } = await axios.post(`/api/skills`, formdata, createAuthHeaders(token));

        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        getSkills();

        Swal.fire('New skill added successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    const handleDragStart = (e) => {
        if (!dragAllowed) return;
        e.dataTransfer.setData("skill-id", e.target.id);
    }

    const handleDrop = (e) => {
        if (!dragAllowed) return;
        const AllSkills = [...skills];
        
        const draggedSkillId = e.dataTransfer.getData("skill-id");
        const droppedOverSkillId = e.target.closest("tr").id;

        if (draggedSkillId === droppedOverSkillId) return;

        const draggedSkillIndex = AllSkills.findIndex(skill => skill._id === draggedSkillId)
        const droppedOverSkillIndex = AllSkills.findIndex(skill => skill._id === droppedOverSkillId)
        
        const draggedSkill = AllSkills.find(skill => skill._id === draggedSkillId)
        const droppedOverSkill = AllSkills.find(skill => skill._id === droppedOverSkillId)
        
        /*****************************************************************************************************/
        /******************************************| Drag n Drop Logic |**************************************/
        /*****************************************************************************************************/
        // There are skills Between them
        if (draggedSkillIndex !== droppedOverSkillIndex + 1 && droppedOverSkillIndex !== draggedSkillIndex + 1) {
            if (draggedSkillIndex < droppedOverSkillIndex) {
                AllSkills.splice(droppedOverSkillIndex, 1, droppedOverSkill, draggedSkill);
                AllSkills.splice(draggedSkillIndex, 1);
            } else {
                AllSkills.splice(droppedOverSkillIndex, 1, draggedSkill, droppedOverSkill);
                AllSkills.splice(draggedSkillIndex + 1, 1);
            }
        } 
        // There are No skills Between them
        else {
            if (draggedSkillIndex < droppedOverSkillIndex) {
                AllSkills.splice(droppedOverSkillIndex, 1, droppedOverSkill, draggedSkill);
                AllSkills.splice(draggedSkillIndex, 1);
            } else {
                AllSkills.splice(droppedOverSkillIndex, 1, draggedSkill, droppedOverSkill);
                AllSkills.splice(draggedSkillIndex + 1, 1);
            }
        }

        // Handle The Change Of Priority
        const updatedSkills = AllSkills.map((skill, idx) => {
            skill.priority = idx + 1;
            return skill;
        });

        // Change Order In UI
        setSkills(updatedSkills);
    }

    const cancelOrder = () => {
        getSkills();
        setDragAllowed(false);
    }

    const saveOrder = async () => {
        showLoader();

        // Save The New Order To DB
        const dataToUpdate = skills.map(({_id, priority}) => ({_id, priority}));
        
        const { data: {err} } = await axios.patch(`/api/skills/updateOrder`, dataToUpdate, createAuthHeaders(token))
        
        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        Swal.fire('New order saved', '', 'success');
        
        setDragAllowed(false);

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
                    <button className="me-2" onClick={() => setAddEditMode(true)}><i className="fal fa-plus-square me-1" /> Add New Skill</button>
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
                                    <tr 
                                        key={skill._id} 
                                        draggable={dragAllowed} 
                                        onDragStart={handleDragStart} 
                                        onDrop={handleDrop} 
                                        onDragOver={(e) => e.preventDefault()}
                                        id={skill._id}
                                        className={dragAllowed ? "draggable" : ""}
                                    >
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
