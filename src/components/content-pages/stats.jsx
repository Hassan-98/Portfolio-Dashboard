import { useEffect, useState, useRef } from 'react';
import Swal from "sweetalert2";
import axios from "../../axios/axios";
import { useCookies } from 'react-cookie';
import { createAuthHeaders } from "../../utils/headers";
import { showLoader, hideLoader } from "../loader.jsx";

const Stats = () => {
    const [stats, setStats] = useState([]);
    const [addEditMode, setAddEditMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [{portfolioCurrentAdmin: token}] = useCookies(['portfolioCurrentAdmin']);
    const nameInput = useRef();
    const numberInput = useRef();
    const pictureInput = useRef();

    const getStats = async () => {
        const { data: {err, success} } = await axios.get('/api/stats');

        if (err) return;
    
        setStats(success);
    }

    useEffect(() => {
        getStats();
    }, []);

    const goBack = () => {
        setAddEditMode(false);
        setEditMode(false);
    }

    const setupEditStat= (ID) => {
        setAddEditMode(true);
        setEditMode({ID});
        const Stat = stats.find(stat => stat._id === ID);

        setTimeout(() => {
            nameInput.current.value = Stat.name;
            numberInput.current.value = Stat.number;
        }, 0);
    }

    const deleteStat = (ID) => {
        Swal.fire({
            title: 'Do you want to delete this statstic?',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { data: {err} } = await axios.delete(`/api/stats?id=${ID}`, createAuthHeaders(token));
        
                if (err) return Swal.fire({ icon: 'error', title: err });
        
                getStats();
        
                Swal.fire('Deleted!', '', 'success');
            }
        });
    }

    const edit = async () => {
        const {ID} = editMode;
        showLoader();
        const Stat = {
            name: nameInput.current.value,
            number: numberInput.current.value,
        };

        var picture = pictureInput.current.files[0];

        if (Stat.name === "" || Stat.number === "") {
            hideLoader();
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();
        formdata.set('name', Stat.name);
        formdata.set('number', Stat.number);

        if (picture) formdata.append('picture', picture);

        const {data: {err}} = await axios.patch(`/api/stats?id=${ID}`, formdata, createAuthHeaders(token));

        if (err) return Swal.fire({ icon: 'error', title: err });
        
        getStats();

        Swal.fire('Statstic edited successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    const add = async () => {
        showLoader();
        const Stat = {
            name: nameInput.current.value,
            number: numberInput.current.value,
        };

        var picture = pictureInput.current.files[0];

        if (Stat.name === "" || Stat.number === "" || !picture) {
            hideLoader();
            return Swal.fire({ icon: 'error', title: 'You have missed out some empty fields' });
        }
        
        const formdata = new FormData();
        formdata.set('name', Stat.name);
        formdata.set('number', Stat.number);
        formdata.append('picture', picture);

        const {data: {err}} = await axios.post(`/api/stats`, formdata, createAuthHeaders(token));

        if (err) return Swal.fire({ icon: 'error', title: err });

        getStats();

        Swal.fire('New statstic added successfully!', '', 'success');

        setAddEditMode(false);

        setEditMode(false);

        hideLoader();
    }

    return (
        <section className="stats-settings">
            <div className="container">
                <h2>Statstics</h2>
                <hr />
                
                {
                    !addEditMode && (
                        <div className="nav">
                            <button onClick={() => setAddEditMode(true)}><i className="fal fa-plus-square me-1" /> Add New Statstic</button>
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
                                        <th>Name</th>
                                        <th>Number</th>
                                        <th>Picture</th>
                                        <th>Update</th>
                                        <th>Delete</th>
                                    </tr>
                                    {
                                        stats.length ? stats.map((stat, i) => 
                                        (
                                            <tr key={stat._id} id={stat._id}>
                                                <td>{ i + 1 }</td>
                                                <td>{ stat.name }</td>
                                                <td>{ stat.number }</td>
                                                <td><img src={stat.picture} alt="pic" /></td>
                                                <td>
                                                    <button className="edit" onClick={() => setupEditStat(stat._id)}>
                                                    <i className="fas fa-edit" />
                                                    </button>
                                                </td>
                                                <td>
                                                    <button className="del" onClick={() => deleteStat(stat._id)}>
                                                    <i className="fas fa-trash-alt" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) 
                                        :
                                        (
                                            <tr>
                                                <td colSpan="6">No Statstics Yet</td>
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
                            <h3>{editMode ? "Edit" : "Add"} Statstic</h3>
                            <label>Statstic Name</label>
                            <input ref={nameInput} type="text" placeholder="Statstic Name" />
                            <label>Statstic Number</label>
                            <input ref={numberInput} type="number" placeholder="Statstic Number" />
                            <label>Picture</label>
                            <input ref={pictureInput} type="file" className="pic" />
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

export default Stats
