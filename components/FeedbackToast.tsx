import { toastPayloadsVar } from "@/graphql/reactiveVariables";
import { useReactiveVar } from "@apollo/client";
import { ReactNode, useState } from "react";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

export default function FeedbackToast({
  children,
}: Record<"children", ReactNode>) {
  const toastPayloads = useReactiveVar(toastPayloadsVar);

  const [show, setShow] = useState(!!toastPayloads.length);

  const handleClose = (reset: (() => void) | undefined) =>
    reset ? (setShow(false), reset()) : setShow(false);

  return (
    <>
      <ToastContainer position="middle-center">
        {toastPayloads.map(({ error, successText, reset }, i) => (
          <Toast
            key={i}
            bg={error ? "danger" : "success"}
            show={show}
            onClose={() => handleClose(reset)}
            autohide
          >
            <Toast.Header className="justify-content-between h5">
              {error?.name || "Success"}
            </Toast.Header>
            {error && (
              <Toast.Body className="justify-content-between text-white">
                {error.message}
              </Toast.Body>
            )}
            {successText && (
              <Toast.Body className="justify-content-between text-white">
                {successText}
              </Toast.Body>
            )}
          </Toast>
        ))}
      </ToastContainer>
      {children}
    </>
  );
}
