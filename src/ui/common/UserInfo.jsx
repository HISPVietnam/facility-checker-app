import { Tag } from "@dhis2/ui";
import useMetadataStore from "@/states/metadata";
import { useTranslation } from "react-i18next";

const UserInfo = () => {
  const { t } = useTranslation();
  const me = useMetadataStore((state) => state.me);
  const { firstName, surname, authorities } = me;
  return (
    <div>
      <Tag bold>
        {t("user")}: {firstName} {surname}
      </Tag>
      &nbsp;
      <Tag bold positive>
        {t("authorities")}: {me.authorities.join(", ")}
      </Tag>
    </div>
  );
};

export default UserInfo;
