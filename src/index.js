import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { CookiesProvider } from 'react-cookie';
import App from './App';
import store from "./store/index";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/fontawesome/css/all.min.css";

ReactDOM.render(
  <Provider store={store}>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </Provider>,
  document.getElementById('root')
);
