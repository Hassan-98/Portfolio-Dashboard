import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { showLoader, hideLoader } from "../loader.jsx";

const Portfolio = () => {
    const [projects, setProjects] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const titleInput = useRef();
    const langsInput = useRef();
    const priorityInput = useRef();
    const urlInput = useRef();
    const thumbInput = useRef();

    const getProjects = async () => {
        const { data } = await axios.get('/api/portfolio');
        setProjects(data)
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
            priorityInput.current.value = project.priority;
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
                const { data } = await axios.delete(`/api/portfolio?id=${ID}`);
                if (data === "Deleted") {
                    getProjects();
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
        const projectId = editMode.projectId;
        showLoader();
        const project = {
            title: titleInput.current.value,
            langs: langsInput.current.value,
            priority: priorityInput.current.value,
            url: urlInput.current.value,
        };

        var thumb = thumbInput.current.files[0];

        if (project.title === "" || project.langs === "" || project.priority === "" || project.url === "") {
            hideLoader();
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Empty Fileds"
            });
        }
        
        const formdata = new FormData();
        formdata.set('name', project.title);
        formdata.set('langs', project.langs);
        formdata.set('priority', project.priority);
        formdata.set('url', project.url);

        if (thumb) formdata.append('thumb', thumb);

        const {data} = await axios.patch(`/api/portfolio?id=${projectId}`, formdata)
        if (data._id) {
            getProjects();
            Swal.fire('Project Edited Successfully!', '', 'success');
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
        const project = {
            title: titleInput.current.value,
            langs: langsInput.current.value,
            priority: priorityInput.current.value,
            url: urlInput.current.value,
        };

        var thumb = thumbInput.current.files[0];

        if (project.title === "" || project.langs === "" || project.priority === "" || project.url === "" || !thumb) {
            hideLoader();
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Empty Fileds"
            });
        }
        
        const formdata = new FormData();
        formdata.set('name', project.title);
        formdata.set('langs', project.langs);
        formdata.set('priority', project.priority);
        formdata.set('url', project.url);
        formdata.append('thumb', thumb);

        const {data} = await axios.post(`/api/portfolio`, formdata)
        if (data._id) {
            getProjects();
            Swal.fire('Project Added Successfully!', '', 'success');
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
        <section className="portfolio-settings">
            <div className="container">
                <h2>Portfolio</h2>
                <hr />
                {
                    !addEditMode && (
                        <div className="nav">
                            <button onClick={() => setAddEditMode(true)}><i className="fal fa-plus-square me-1" /> Add New Project</button>
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
                                            <tr key={proj._id}>
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
                            <label>Project Show Priority</label>
                            <input ref={priorityInput} type="number" placeholder="Project Priority" />
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
