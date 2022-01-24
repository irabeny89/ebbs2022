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
import {
  ORDER_LIST,
  REQUEST_LIST,
  SET_ORDER_STATUS,
} from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import { toastsVar } from "@/graphql/reactiveVariables";
import SortedListWithTabs from "./SortedListWithTabs";
import OrdersOrRequests from "./OrdersOrRequests";
import MoreButton from "./MoreButton";
import { useEffect, useRef } from "react";

// tab title style
const tabTitleStyle = { fontSize: 16 },
  Dashboard = ({ info, service: { orders }, requests }: DashboardPropType) => {
    // state variable
    const hasLazyFetchedOrders = useRef(false),
      hasLazyFetchedRequests = useRef(false);
    // query more orders
    const [getMoreOrders, { data: orderData, loading, fetchMore }] =
        useLazyQuery<
          Record<"orders", CursorConnectionType<OrderVertexType>>,
          Record<"orderArgs", PagingInputType>
        >(ORDER_LIST),
      // query more requests
      [
        getMoreRequests,
        {
          data: requestData,
          loading: requestLoading,
          fetchMore: fetchMoreRequests,
        },
      ] = useLazyQuery<
        Record<"requests", CursorConnectionType<OrderVertexType>>,
        Record<"requestArgs", PagingInputType>
      >(REQUEST_LIST);
    // extract orders from edge
    const orderList = (
        orders?.edges.map((orderEdge) => orderEdge.node) ?? []
      ).concat(
        orderData?.orders.edges.map((orderEdge) => orderEdge.node) ?? []
      ),
      // extract requests from edge
      requestList = (
        requests?.edges.map((requestEdge) => requestEdge.node) ?? []
      ).concat(
        requestData?.requests.edges.map((requestEdge) => requestEdge.node) ?? []
      );
    // indicate orders has lazy fetched once
    useEffect(() => {
      orderData && (hasLazyFetchedOrders.current = true);
    }, []);
    // indicate requests has lazy fetched once
    useEffect(() => {
      requestData && (hasLazyFetchedRequests.current = true);
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
              ListRenderer={OrdersOrRequests}
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
                hasLazyFetched={hasLazyFetchedOrders}
                variables={{
                  orderArgs: {
                    last: 20,
                    before: hasLazyFetchedOrders.current
                      ? orderData?.orders.pageInfo.endCursor
                      : orders.pageInfo.endCursor,
                  },
                }}
              />
            )}
          </Tab>
          {/* request tab */}
          <Tab
            eventKey="request"
            title={<h5 style={tabTitleStyle}>Requests</h5>}
            className="my-5"
          >
            {/* list of sorted orders by status */}
            <SortedListWithTabs
              className=""
              ListRenderer={OrdersOrRequests}
              field="status"
              list={requestList}
              rendererProps={{
                className: "pt-4 rounded",
                statuses: ["CANCELED", "DELIVERED"],
              }}
            />
            {requests?.pageInfo.hasNextPage && (
              <MoreButton
                customFetch={getMoreRequests}
                fetchMore={fetchMoreRequests}
                label="Load more"
                loading={requestLoading}
                hasLazyFetched={hasLazyFetchedRequests}
                variables={{
                  requestArgs: {
                    last: 20,
                    before: hasLazyFetchedRequests.current
                      ? requestData?.requests.pageInfo.endCursor
                      : requests.pageInfo.endCursor,
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
