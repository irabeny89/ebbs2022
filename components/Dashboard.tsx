import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import {
  MdDashboardCustomize,
  MdDashboard,
  MdControlPoint,
  MdAdminPanelSettings,
  MdSettingsApplications,
} from "react-icons/md";
import {
  CursorConnectionType,
  DashboardPropType,
  OrderVertexType,
  PagingInputType,
} from "types";
import EmptyList from "./EmptyList";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import getLocalePrice from "@/utils/getLocalePrice";
import { useLazyQuery } from "@apollo/client";
import { ORDER_LIST, SET_ORDER_STATUS } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import { toastsVar } from "@/graphql/reactiveVariables";
import SortedListWithTabs from "./SortedListWithTabs";
import Orders from "./Orders";
import MoreButton from "./MoreButton";
import { useEffect, useRef } from "react";

// tab title style
const tabTitleStyle = { fontSize: 16 },
  Dashboard = ({ info, service: { orders } }: DashboardPropType) => {
    // state variable
    const hasLazyFetched = useRef(false);
    // query more orders
    const [getMoreOrders, { data: orderData, error, loading, fetchMore }] =
      useLazyQuery<
        Record<"orders", CursorConnectionType<OrderVertexType>>,
        Record<"orderArgs", PagingInputType>
      >(ORDER_LIST);
    // extract orders from edge
    const orderList = (
      orders?.edges.map((orderEdge) => orderEdge.node) ?? []
    ).concat(orderData?.orders.edges.map((orderEdge) => orderEdge.node) ?? []);
    // indicate has lazy fetched once
    useEffect(() => {
      orderData && (hasLazyFetched.current = true);
    }, []);

    return (
      <Container>
        {/* title */}
        <Row>
          <Col className="h1 my-5" as="h2">
            <MdDashboardCustomize size={40} /> Dashboard
          </Col>
        </Row>
        {/* first paragraph */}
        <Row>
          <Col as="p" className="display-5 text-center my-5">
            {info}
          </Col>
        </Row>
        {/* dashboard tabs */}
        <Tabs defaultActiveKey="order" className="my-5">
          {/* order tab */}
          <Tab
            eventKey="order"
            title={<h5 style={tabTitleStyle}>Orders</h5>}
            className="my-5"
          >
            {/* list of sorted orders by status */}
            <SortedListWithTabs
              className=""
              ListRenderer={Orders}
              field="status"
              list={orderList}
              rendererProps={{ className: "pt-4 rounded" }}
            />
            {orders?.pageInfo.hasNextPage && (
              <MoreButton
                customFetch={getMoreOrders}
                fetchMore={fetchMore}
                label="Load more"
                loading={loading}
                hasLazyFetched={hasLazyFetched}
                variables={{
                  orderArgs: {
                    last: 20,
                    before: hasLazyFetched.current
                      ? orderData?.orders.pageInfo.endCursor
                      : orders.pageInfo.endCursor,
                  },
                }}
              />
            )}
          </Tab>
        </Tabs>
      </Container>
    );
  };

export default Dashboard;
