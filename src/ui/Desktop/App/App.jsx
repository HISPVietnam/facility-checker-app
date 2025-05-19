import { HeaderBar, Button, CircularLoader } from "@dhis2/ui";
import { Routes, Route, useNavigate } from "react-router";
import Sidebar from "@/ui/Desktop/Sidebar/Sidebar";
import CollapsedSidebar from "@/ui/Desktop/Sidebar/CollapsedSidebar";
import Home from "@/ui/Desktop/Home/Home";
import HomeToolbar from "@/ui/Desktop/Home/HomeToolbar";
import FacilitiesManagement from "@/ui/Desktop/FacilitiesManagement/FacilitiesManagement";
import FacilitiesManagementToolbar from "@/ui/Desktop/FacilitiesManagement/FacilitiesManagementToolbar";
import Synchronization from "@/ui/Desktop/Synchronization/Synchronization";
import SynchronizationToolbar from "@/ui/Desktop/Synchronization/SynchronizationToolbar";
import Approval from "@/ui/Desktop/Approval/Approval";
import ApprovalToolbar from "@/ui/Desktop/Approval/ApprovalToolbar";
import Installation from "@/ui/Desktop/Installation/Installation";
import Configuration from "@/ui/Desktop/Configuration/Configuration";
import ConfigurationToolbar from "@/ui/Desktop/Configuration/ConfigurationToolbar";
import useLayoutStore from "@/states/layout";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import useInit from "@/hooks/useInit";
import { useEffect, useState } from "react";
import useMetadataStore from "@/states/metadata";
import { getSystemInfo } from "@/api/metadata";

const App = () => {
  const { systemInfo, metadataStoreActions } = useMetadataStore(
    useShallow((state) => ({
      systemInfo: state.systemInfo,
      metadataStoreActions: state.actions
    }))
  );
  const { ready, firstRun } = useInit();
  const { t } = useTranslation();
  const { setMetadata } = metadataStoreActions;
  const { layout, actions } = useLayoutStore(
    useShallow((state) => ({
      layout: state.layout,
      actions: state.actions
    }))
  );
  const { sidebar } = layout;
  const { toggleSidebar } = actions;
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/home");
  }, []);

  useEffect(() => {
    (async () => {
      const systemInfoResult = await getSystemInfo();
      setMetadata("systemInfo", systemInfoResult);
    })();
  }, []);

  let appHeightClassName = "";
  let withHeaderBar = false;
  if (systemInfo && systemInfo.version < "2.42") {
    appHeightClassName = "h-[calc(100%-48px)]";
    withHeaderBar = true;
  } else {
    appHeightClassName = "h-full";
  }

  return (
    <div className="w-full h-full text-slate-700">
      {withHeaderBar && <HeaderBar />}
      <div className={`w-full ${appHeightClassName} flex items-center justify-center`}>
        {!ready && <CircularLoader />}
        {ready && !firstRun && (
          <>
            {sidebar ? <Sidebar /> : <CollapsedSidebar />}
            <div className={`h-full ${sidebar ? "w-[calc(100%-250px)]" : "w-[calc(100%-60px)]"} bg-slate-100`}>
              <div className="h-[60px] w-full bg-white border-b-slate-300 border-b flex items-center p-2">
                {/* <div>
                  <Button icon={<FontAwesomeIcon icon={sidebar ? faCaretLeft : faCaretRight} />} onClick={toggleSidebar}>
                    {sidebar ? t("expand") : t("collapse")}
                  </Button>
                </div>
                <VerticalDivider /> */}
                <Routes>
                  <Route path="/home" element={<HomeToolbar />} />
                  <Route path="/" element={<HomeToolbar />} />
                  <Route path="/facility-check" element={<FacilitiesManagementToolbar />} />
                  <Route path="/approval" element={<ApprovalToolbar />} />
                  <Route path="/synchronization" element={<SynchronizationToolbar />} />
                  <Route path="/configuration" element={<ConfigurationToolbar />} />
                </Routes>
              </div>
              <div className="h-[calc(100%-60px)] w-full flex items-center justify-center">
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/facility-check" element={<FacilitiesManagement />} />
                  <Route path="/approval" element={<Approval />} />
                  <Route path="/synchronization" element={<Synchronization />} />
                  <Route path="/configuration" element={<Configuration />} />
                </Routes>
              </div>
            </div>
          </>
        )}
        {ready && firstRun && <Installation />}
      </div>
    </div>
  );
};

export default App;
