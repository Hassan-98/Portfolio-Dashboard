import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { useCookies } from 'react-cookie';
import { showLoader, hideLoader } from "../loader.jsx";
import { createAuthHeaders } from "../../utils/headers";

const Portfolio = () => {
    const [projects, setProjects] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [dragAllowed, setDragAllowed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
    const titleInput = useRef();
    const langsInput = useRef();
    const urlInput = useRef();
    const thumbInput = useRef();

    const getProjects = async () => {
        const { data: {err, success} } = await axios.get('/api/portfolio');
        if (err) return;

        setProjects(success)
    }

    useEffect(() => {
        getProjects();
    }, []);

    const goBack = () => {
        setAddEditMode(false);
        setEditMode(false);
    }

    const setupEditProject= (ID) => {
        setAddEditMode(true);
        setEditMode({projectId: ID});
        const project = projects.find(proj => proj._id === ID);

        setTimeout(() => {
            titleInput.current.value = project.name;
            langsInput.current.value = project.langs;
            urlInput.current.value = project.url;
        }, 0);
    }

    const deleteProject = (ID) => {
        Swal.fire({
            title: 'Do you want to delete this project?',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { data: {err} } = await axios.delete(`/api/portfolio?id=${ID}`, createAuthHeaders(token));

                if (err) return Swal.fire({ icon: 'error', title: err });

                getProjects();

                Swal.fire('Deleted!', '', 'success')
            }
        });
    }

    const edit = async () => {
        const projectId = editMode.projectId;
        showLoader();
        const project = {
            title: titleInput.current.value,
            langs: langsInput.current.value,
            url: urlInput.current.value,
        };

        var thumb = thumbInput.current.files[0];

        if (project.title === "" || project.langs === "" || project.url === "") {
            hideLoader();
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();

        formdata.set('name', project.title);
        formdata.set('langs', project.langs);
        formdata.set('url', project.url);

        if (thumb) formdata.append('thumb', thumb);

        const { data: {err} } = await axios.patch(`/api/portfolio?id=${projectId}`, formdata, createAuthHeaders(token))

        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        getProjects();

        Swal.fire('Project edited successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    const add = async () => {
        showLoader();
        const project = {
            title: titleInput.current.value,
            langs: langsInput.current.value,
            url: urlInput.current.value,
        };

        var thumb = thumbInput.current.files[0];

        if (project.title === "" || project.langs === "" || project.url === "" || !thumb) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();

        formdata.set('name', project.title);
        formdata.set('langs', project.langs);
        formdata.set('url', project.url);
        formdata.append('thumb', thumb);

        const { data: {err} } = await axios.post(`/api/portfolio`, formdata, createAuthHeaders(token))

        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        getProjects();

        Swal.fire('New project added successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    const handleDragStart = (e) => {
        if (!dragAllowed) return;
        e.dataTransfer.setData("project-id", e.target.id);
    }

    const handleDrop = (e) => {
        if (!dragAllowed) return;
        const AllProjects = [...projects];
        
        const draggedProjectId = e.dataTransfer.getData("project-id");
        const droppedOverProjectId = e.target.closest("tr").id;

        if (draggedProjectId === droppedOverProjectId) return;

        const draggedProjectIndex = AllProjects.findIndex(project => project._id === draggedProjectId)
        const droppedOverProjectIndex = AllProjects.findIndex(project => project._id === droppedOverProjectId)
        
        const draggedProject = AllProjects.find(project => project._id === draggedProjectId)
        const droppedOverProject = AllProjects.find(project => project._id === droppedOverProjectId)
        
        /*****************************************************************************************************/
        /******************************************| Drag n Drop Logic |**************************************/
        /*****************************************************************************************************/
        // There are projects Between them
        if (draggedProjectIndex !== droppedOverProjectIndex + 1 && droppedOverProjectIndex !== draggedProjectIndex + 1) {
            if (draggedProjectIndex < droppedOverProjectIndex) {
                AllProjects.splice(droppedOverProjectIndex, 1, droppedOverProject, draggedProject);
                AllProjects.splice(draggedProjectIndex, 1);
            } else {
                AllProjects.splice(droppedOverProjectIndex, 1, draggedProject, droppedOverProject);
                AllProjects.splice(draggedProjectIndex + 1, 1);
            }
        }
        // There are No projects Between them
        else {
            if (draggedProjectIndex < droppedOverProjectIndex) {
                AllProjects.splice(droppedOverProjectIndex, 1, droppedOverProject, draggedProject);
                AllProjects.splice(draggedProjectIndex, 1);
            } else {
                AllProjects.splice(droppedOverProjectIndex, 1, draggedProject, droppedOverProject);
                AllProjects.splice(draggedProjectIndex + 1, 1);
            }
        }

        // Handle The Change Of Priority
        const updatedProjects = AllProjects.map((project, idx) => {
            project.priority = idx + 1;
            return project;
        });

        // Change Order In UI
        setProjects(updatedProjects);
    }

    const cancelOrder = () => {
        getProjects();
        setDragAllowed(false);
    }

    const saveOrder = async () => {
        showLoader();

        // Save The New Order To DB
        const dataToUpdate = projects.map(({_id, priority}) => ({_id, priority}));
        
        const { data: {err} } = await axios.patch(`/api/portfolio/updateOrder`, dataToUpdate, createAuthHeaders(token))
        
        if (err) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: err });
        }

        Swal.fire('New order saved', '', 'success');
        
        setDragAllowed(false);

        hideLoader();
    }

    return (
        <section className="portfolio-settings">
            <div className="container">
                <h2>Portfolio</h2>
                <hr />
                {
                    !addEditMode && (
                        <div className="nav">
                            <button className="me-2" onClick={() => setAddEditMode(true)}><i className="fad fa-plus-square me-1" /> Add New Project</button>
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
                                    <th>thumb</th>
                                    <th>Project Name</th>
                                    <th>Frameworks & Tools</th>
                                    <th>Edit</th>
                                    <th>Delete</th>
                                    </tr>
                                    {
                                        projects.length ? projects.map(proj => 
                                        (
                                            <tr 
                                                key={proj._id} 
                                                draggable={dragAllowed} 
                                                onDragStart={handleDragStart} 
                                                onDrop={handleDrop} 
                                                onDragOver={(e) => e.preventDefault()}
                                                id={proj._id}
                                                className={dragAllowed ? "draggable" : ""}
                                            >
                                                <td>{ proj.priority }</td>
                                                <td><img src={proj.thumb} alt="thumb" /></td>
                                                <td>{ proj.name }</td>
                                                <td>{ proj.langs }</td>
                                                <td>
                                                    <button className="edit" onClick={() => setupEditProject(proj._id)}>
                                                        <i className="fas fa-edit" />
                                                    </button>
                                                </td>
                                                <td>
                                                    <button className="del" onClick={() => deleteProject(proj._id)}>
                                                        <i className="fas fa-trash-alt" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) 
                                        :
                                        (
                                            <tr>
                                                <td colSpan="6">No Projects Yet</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    ) :
                    (
                        <div className="editMode">
                            <button className="back" onClick={goBack}><i className="fas fa-long-arrow-alt-left" /></button>
                            <h3>{editMode ? "Edit" : "Add"} Project</h3>
                            <label>Project Title</label>
                            <input ref={titleInput} type="text" placeholder="Project Title" />
                            <label>Project Used Languages & Tools <span className="text-muted">(Ex: React.js, Scss)</span></label>
                            <input ref={langsInput} type="text" placeholder="Project Languages (Siprated by commas)" />
                            <label>Project External URL</label>
                            <input ref={urlInput} type="text" placeholder="Project URL" />
                            <label>Project Thumb</label>
                            <input ref={thumbInput} type="file" className="thumb" />
                            {
                                editMode ? <button onClick={edit}>Edit</button> : <button onClick={add}>Save</button>
                            }
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default Portfolio
