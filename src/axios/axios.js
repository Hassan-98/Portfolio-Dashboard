import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://portfolio-api-hassanali.herokuapp.com";
// axios.defaults.baseURL = "http://localhost:4001";

export default axios;