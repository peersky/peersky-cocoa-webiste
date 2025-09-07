export type { ChakraProps } from "@chakra-ui/react";
// Components
export { default as ChainSelector } from "./components/ChainSelector";
export { default as ContractGenericState } from "./components/ContractGenericState";
export { default as ContractInterface } from "./components/ContractInteface";
export { default as Footer } from "./components/Footer";
export { default as SEOHead } from "./components/HeadSEO";
export { default as Navbar } from "./components/Navbar";
export { default as PixelsCard } from "./components/PixelsCard";
export { default as RouteButton } from "./components/RouteButton";
export { default as Scrollable } from "./components/Scrollable";
export { default as Sidebar } from "./components/Sidebar";
export { default as SplitWithImage } from "./components/SplitWithImage";
export { default as StateItem } from "./components/StateItem";
export { default as UploadABI } from "./components/UploadAbi";
export { default as Web3MethodField } from "./components/We3MethodField";
export { default as Web3MethodForm } from "./components/Web3MethodForm";

// Hooks
export { default as useABIItemForm } from "./hooks/useAbiItemForm";
export { default as useAppRouter } from "./hooks/useRouter";
export { default as useStorage } from "./hooks/useStorage";
export { default as useToast } from "./hooks/useToast";

// Layouts
export {
  default as AppLayout,
  getLayout as getAppLayout,
} from "./layouts/AppLayout";
export {
  default as BlogLayout,
  getLayout as getBlogLayout,
} from "./layouts/BlogLayout";
export {
  default as ContractLayout,
  getLayout as getContractLayout,
} from "./layouts/ContractLayout";
export { default as DefaultLayout, getLayout } from "./layouts";

// Providers
export { default as UIProvider } from "./providers/UIProvider";
export { default as UIContext } from "./providers/UIProvider/context";
export { default as Web3Provider } from "./providers/Web3Provider";
export {
  default as Web3Context,
  WALLET_STATES,
} from "./providers/Web3Provider/context";

// Theme
export { default as theme } from "./theme/theme";

// Types
export * from "./types";
