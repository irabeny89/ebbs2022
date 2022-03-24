import Badge from "react-bootstrap/Badge";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import EmptyList from "./EmptyList";
import type { SortedListWithTabsPropType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";

// first level sort eg {a:1} not {a:{b:2}}
const SortedListWithTabs = ({
  list,
  field,
  className = "bg-danger my-0",
  ListRenderer,
  rendererProps = {},
  tabsVariantStyle,
}: SortedListWithTabsPropType) => {
  return (
    <Tabs id="category-tabs" defaultActiveKey="ALL" variant={tabsVariantStyle}>
      {/* return an array of categories from list starting with ALL */}
      {["ALL", ...list.map((item) => item[field])]
        // return an array without duplicate categories
        .reduce(
          (prev: string[], cat) => (prev.includes(cat) ? prev : [...prev, cat]),
          []
        )
        // return and render the tabs for the category list
        .map((category: string) => (
          <Tab
            title={
              <>
                {category}
                <Badge pill className="bg-info">
                  {getCompactNumberFormat(
                    category === "ALL"
                      ? list.length
                      : list.filter((item) => item[field] === category).length
                  )}
                </Badge>
              </>
            }
            eventKey={category}
            key={category}
          >
            <Row className={className}>
              {list.length ? (
                <ListRenderer
                  {...rendererProps}
                  items={
                    category === "ALL"
                      ? list
                      : list.filter((item) => item[field] === category)
                  }
                />
              ) : (
                <EmptyList message="No item yet" />
              )}
            </Row>
          </Tab>
        ))}
    </Tabs>
  );
};

export default SortedListWithTabs;
