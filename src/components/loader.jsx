import React from "react";

export const showLoader = () => document.querySelector(".loader").style.display = "flex";
export const hideLoader = () => document.querySelector(".loader").style.display = "none";

const Loader = () => {

  return (
    <div className="loader">
        <div className="lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
  );
};

export default Loader;
