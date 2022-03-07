import { useEffect, SetStateAction, Dispatch } from "react";
import Toast from "react-bootstrap/Toast";

const FeedbackToast = ({
  error,
  successText,
  setShowToast,
  showToast,
}: {
  error?: any;
  successText?: string;
  showToast: boolean;
  setShowToast: Dispatch<SetStateAction<boolean>>;
}) => {
  useEffect(
    () => (successText || error) && setShowToast(true),
    [error, setShowToast, successText]
  );

  return (
    <Toast
      bg={error ? "danger" : "success"}
      show={showToast}
      onClose={() => setShowToast(false)}
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
  );
};

export default FeedbackToast;
