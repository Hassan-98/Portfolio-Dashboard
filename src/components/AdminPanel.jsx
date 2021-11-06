import { useState, useEffect, Suspense, lazy } from 'react'
import Sidebar from "./Sidebar.jsx";
const Content = lazy(() => import("./Content.jsx"));

const AdminPanel = () => {
    const [mobileView, setMobileView] = useState(false);
    const [openedSidebar, setOpenedSidebar] = useState(false);
  
    useEffect(() => {
        setMobileView(window.matchMedia('(max-width: 767px)').matches)
        window.onresize = () => {
            setMobileView(window.matchMedia('(max-width: 767px)').matches)
        }
    }, []);

    return (
        <section className="admin-panel">
              {
                (mobileView && !openedSidebar) && <i className="showSideBar fas fa-sliders-h" onClick={() => setOpenedSidebar(true)} />
              }
              <div className="row" style={{direction: "rtl"}}>
                  {/* Sidebar */}
                  <Sidebar 
                    setOpenedSidebar={setOpenedSidebar} 
                    openedSidebar={openedSidebar} 
                    mobileView={mobileView} 
                  />
                  {/* Content */}
                  <Suspense fallback={<div>Loading</div>}>
                    <Content />
                  </Suspense>
              </div>
            </section>
    )
}

export default AdminPanel
