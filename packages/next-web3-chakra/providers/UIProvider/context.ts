import { createContext } from "react";
import { UIProviderInterface } from "../../types";
const UIContext = createContext<UIProviderInterface>({
  sidebarVisible: false,
  searchBarActive: false,
  isMobileView: false,
  sidebarCollapsed: false,
  sidebarToggled: false,
  searchTerm: "",
  sessionId: "",
  setSearchBarActive: () => console.error("not intied"),
  setSidebarCollapsed: () => console.error("not intied"),
  setSearchTerm: () => console.error("not intied"),
  setSidebarToggled: () => console.error("not intied"),
  setSidebarVisible: () => console.error("not intied"),
});

export default UIContext;
