import { Card } from "@dhis2/ui";
import appIcon from "@/assets/icon.png";
import hispvnLogo from "@/assets/hispvn.png";

const Home = () => {
  return (
    <div className="p-20 w-full h-full">
      <Card className="p-10 w-full h-full !flex !items-center flex-col">
        <div>
          <img className="w-[80px]" src={appIcon}></img>
        </div>
        <div className="font-bold text-[30px]">Welcome to Facility Checker App</div>
        <br />
        <div className="w-full text-left font-bold">Getting started:</div>
        <br />
        <div className="w-full text-justify">
          - Facilities management: A user-friendly map interface that allows district officers to zoom in on their district boundaries and visualize
          facility locations, labeled by name, with satellite or/and OpenStreetmap imagery in the background for reference.
        </div>
        <br />
        <div className="w-full text-justify">- Administration: Used for settings of the app, e.g: translations...</div>
        <div className="w-full mt-auto flex items-center ">
          Developed by <img className="h-[60px]" src={hispvnLogo} />
        </div>
      </Card>
    </div>
  );
};
export default Home;
