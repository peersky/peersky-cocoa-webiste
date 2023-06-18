import { useToast as useChakraToast } from "@chakra-ui/react";
import { useCallback } from "react";
const useToast = () => {
  const chakraToast = useChakraToast();

  const toast = useCallback(
    (message: any, type: "info" | "warning" | "success" | "error" | "loading" | undefined, title?: string) => {
      const userTitle = title ?? message?.response?.statusText ?? type;

      const userMessage =
        message?.response?.data?.detail ?? typeof message === "string"
          ? message
          : userTitle === type
          ? ""
          : type;
      const id = `${userTitle}-${userMessage}-${type}`;
      if (!chakraToast.isActive(id)) {
        // if (
        // Object.prototype.hasOwnProperty.call(mixpanel, "get_distinct_id") &&
        // type === "error"
        // ) {
        // mixpanel.track(`${MIXPANEL_EVENTS.TOAST_ERROR_DISPLAYED}`, {
        //   status: message?.response?.status,
        //   title: userTitle,
        //   detail: userMessage,
        // });
        // }

        chakraToast({
          id: id,
          position: "bottom",
          title: userTitle,
          description: userMessage,
          status: type,
          // duration: 3000,
        });
      }
    },
    [chakraToast]
  );

  return toast;
};

export default useToast;
