import mobile from "is-mobile";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { Provider } from "@dhis2/app-runtime";
import { ToastContainer } from "react-toastify";

import DesktopApp from "@/ui/Desktop/App/App";
import MobileApp from "@/ui/Mobile/App/App";
import "react-day-picker/style.css";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "./i18n";
import "react-toastify/dist/ReactToastify.css";
const { VITE_BASE_URL } = import.meta.env;
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Provider
      config={{
        baseUrl: VITE_BASE_URL,
        apiVersion: "",
      }}
    >
      {mobile() ? <MobileApp /> : <DesktopApp />}
      <ToastContainer
        position="bottom-right"
        autoClose={3000} // 3 seconds
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </Provider>
  </HashRouter>
);
