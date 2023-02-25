import React, { useState, useEffect } from "react";
// import { useBreakpointValue } from "@chakra-ui/react";
import useStorage from "../../hooks/useStorage";
import UIContext from "./context";
import { v4 as uuid4 } from "uuid";
import { useBreakpointValue } from "@chakra-ui/react";
import { WebSiteConfig } from "../../types";

const UIProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: WebSiteConfig;
}) => {
  const isMobileView = useBreakpointValue<boolean>(
    {
      base: true,
      sm: true,
      md: false,
      lg: false,
      xl: false,
      "2xl": false,
    },
    "md"
  );
  // const isMobileView = true;

  const [searchTerm, setSearchTerm] = useStorage(
    window.sessionStorage,
    "q",
    ""
  );

  const [searchBarActive, setSearchBarActive] = useState(false);

  // ****** Session state *****
  // Whether sidebar should be toggled in mobile view
  const [sessionId] = useStorage(window.sessionStorage, "sessionID", uuid4());

  // *********** Sidebar states **********************

  // Whether sidebar should be visible at all or hidden
  const [sidebarVisible, setSidebarVisible] = useStorage<boolean>(
    window.sessionStorage,
    "sidebarVisible",
    true
  );
  // Whether sidebar should be smaller state
  const [sidebarCollapsed, setSidebarCollapsed] = useStorage<boolean>(
    window.sessionStorage,
    "sidebarCollapsed",
    false
  );

  // Whether sidebar should be toggled in mobile view
  const [sidebarToggled, setSidebarToggled] = useStorage<boolean>(
    window.sessionStorage,
    "sidebarToggled",
    false
  );

  //Sidebar is visible at all times in mobile view
  useEffect(() => {
    if (isMobileView) {
      setSidebarVisible(true);
      setSidebarCollapsed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileView]);

  //Sidebar is visible at at breakpoint value less then 2
  //Sidebar is visible always in appView
  useEffect(() => {
    if (isMobileView) {
      setSidebarVisible(true);
      setSidebarCollapsed(false);
    } else {
      setSidebarVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileView]);

  return (
    <UIContext.Provider
      value={{
        webSiteConfig: config,
        sidebarVisible,
        setSidebarVisible,
        searchBarActive,
        setSearchBarActive,
        isMobileView,
        sidebarCollapsed,
        setSidebarCollapsed,
        sidebarToggled,
        setSidebarToggled,
        searchTerm,
        setSearchTerm,
        sessionId,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export default UIProvider;
