import Sidebar from "@/ui/Desktop/Sidebar/Sidebar";

const App = () => {
  return (
    <div className="w-full h-full text-slate-800">
      MOBILE
      <div className="w-full h-[calc(100%-48px)] flex">
        <Sidebar />
        <div className="h-full w-[calc(100%-300px)]">asdasdas</div>
      </div>
    </div>
  );
};

export default App;
