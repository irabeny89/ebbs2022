import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";

export default function DashboardServiceAlert() {
  return (
    <Alert variant="info" className="text-center h3">
      Update/setup a service from the{" "}
      <Badge className="bg-light text-primary">Profile</Badge> tab above before
      using this tab.
    </Alert>
  );
}
