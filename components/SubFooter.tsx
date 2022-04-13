import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import config from "config";
import { FaTelegramPlane } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const { socialMedia } = config.appData;

export default function SubFooter() {
  return (
    <Row>
      <Col className="p-2 bg-secondary text-white">
        Social:
        {socialMedia.map(({ name, link }) =>
          name.toLowerCase() === "telegram" ? (
            <a href={link} className="p-2 text-white" key={name}>
              <FaTelegramPlane /> {name}
            </a>
          ) : name.toLowerCase() === "email" ? (
            <a href={`mailto:${link}`} className="p-2 text-white" key={name}>
              <MdEmail /> {name}
            </a>
          ) : (
            <a href={link} key={name}>
              {name}
            </a>
          )
        )}
      </Col>
    </Row>
  );
}
