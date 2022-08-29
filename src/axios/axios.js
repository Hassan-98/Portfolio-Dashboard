import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://portfolio-dashboard-api.onrender.com";
// axios.defaults.baseURL = "http://localhost:4001";

export default axios;