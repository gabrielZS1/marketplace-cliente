import { useState, useEffect, useCallback } from "react";
import AlertModal from "../components/AlertModal";
import { setAlertHandler } from "./alertStore";

export function AlertProvider({ children }) {
  const [state, setState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "error",
    buttons: [],
  });

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const show = useCallback((config) => {
    setState({ visible: true, ...config });
  }, []);

  useEffect(() => {
    setAlertHandler(show);
  }, [show]);

  return (
    <>
      {children}
      <AlertModal
        visible={state.visible}
        title={state.title}
        message={state.message}
        type={state.type}
        buttons={state.buttons}
        onClose={hide}
      />
    </>
  );
}