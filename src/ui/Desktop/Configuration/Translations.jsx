import useMetadataStore from "@/states/metadata";

const Translations = () => {
  const dataStore = useMetadataStore((state) => state.dataStore);

  return <div className="w-full h-full">Translations</div>;
};
export default Translations;
