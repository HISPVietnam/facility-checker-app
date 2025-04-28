import UserInfo from "@/ui/common/UserInfo";

const HomeToolbar = () => {
  return (
    <div className="flex items-center h-full w-full">
      <div className="ml-auto">
        <UserInfo />
      </div>
    </div>
  );
};

export default HomeToolbar;
