import CustomizedButton from "@/ui/common/Button";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const ApprovalToolbar = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center">
      <CustomizedButton primary icon={<FontAwesomeIcon icon={faSync} />}>
        {t("sync")}
      </CustomizedButton>
    </div>
  );
};
export default ApprovalToolbar;
