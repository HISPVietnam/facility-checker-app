import { create } from "zustand";
import { produce } from "immer";

const useLayoutStore = create((set) => ({
  layout: {
    sidebar: true
  },
  actions: {
    toggleSidebar: () =>
      set(
        produce((state) => {
          state.layout.sidebar = !state.layout.sidebar;
        })
      )
  }
}));

export default useLayoutStore;
