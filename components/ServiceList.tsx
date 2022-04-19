import { ServiceListPropType } from "types";
import ServiceCard from "./ServiceCard";

const ServiceList = ({ items, ...rest }: ServiceListPropType) => {
  return (
    <section {...rest}>
      {items.map((service) => (
          <div key={service._id!.toString()} className="m-auto m-lg-2">
            <ServiceCard {...service} />
          </div>
        ))}
    </section>
  );
};

export default ServiceList;
