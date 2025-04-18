import { HeaderBar, Button, CircularLoader } from "@dhis2/ui";
import { Routes, Route, useNavigate } from "react-router";
import VerticalDivider from "@/ui/common/VerticalDivider";
import Sidebar from "@/ui/Desktop/Sidebar/Sidebar";
import CollapsedSidebar from "@/ui/Desktop/Sidebar/CollapsedSidebar";
import Home from "@/ui/Desktop/Home/Home";
import FacilitiesManagement from "@/ui/Desktop/FacilitiesManagement/FacilitiesManagement";
import FacilitiesManagementToolbar from "@/ui/Desktop/FacilitiesManagement/FacilitiesManagementToolbar";
import Approval from "@/ui/Desktop/Approval/Approval";
import ApprovalToolbar from "@/ui/Desktop/Approval/ApprovalToolbar";
import useLayoutStore from "@/states/layout";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import useInit from "@/hooks/useInit";
import { useEffect } from "react";
import SynchronizationToolbar from "../Synchronization/SynchronizationToolbar";
import Synchronization from "../Synchronization/Synchronization";

const App = () => {
  const ready = useInit();
  const { t } = useTranslation();
  const { layout, actions } = useLayoutStore(
    useShallow((state) => ({
      layout: state.layout,
      actions: state.actions,
    }))
  );
  const { sidebar } = layout;
  const { toggleSidebar } = actions;
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/home");
  }, []);

  return (
    <div className="w-full h-full text-slate-700">
      <HeaderBar />
      <div className="w-full h-[calc(100%-48px)] flex items-center justify-center">
        {ready ? (
          <>
            {sidebar ? <Sidebar /> : <CollapsedSidebar />}
            <div
              className={`h-full ${
                sidebar ? "w-[calc(100%-250px)]" : "w-[calc(100%-60px)]"
              } bg-slate-100`}
            >
              <div className="h-[60px] w-full bg-white border-b-slate-300 border-b flex items-center p-2">
                {/* <div>
                  <Button icon={<FontAwesomeIcon icon={sidebar ? faCaretLeft : faCaretRight} />} onClick={toggleSidebar}>
                    {sidebar ? t("expand") : t("collapse")}
                  </Button>
                </div>
                <VerticalDivider /> */}
                <div>
                  <Routes>
                    <Route path="/home" element={<div />} />
                    <Route path="/" element={<div />} />
                    <Route
                      path="/facility-check"
                      element={<FacilitiesManagementToolbar />}
                    />
                    <Route path="/approval" element={<ApprovalToolbar />} />
                    <Route
                      path="/synchronization"
                      element={<SynchronizationToolbar />}
                    />
                  </Routes>
                </div>
              </div>
              <div className="h-[calc(100%-60px)] w-full flex items-center justify-center">
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/facility-check"
                    element={<FacilitiesManagement />}
                  />
                  <Route path="/approval" element={<Approval />} />
                  <Route
                    path="/synchronization"
                    element={<Synchronization />}
                  />
                </Routes>
              </div>
            </div>
          </>
        ) : (
          <CircularLoader />
        )}
      </div>
    </div>
  );
};

export default App;
