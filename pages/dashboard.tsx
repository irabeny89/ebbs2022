import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Badge from "react-bootstrap/Badge";
import { MdDashboardCustomize } from "react-icons/md";
import { AuthComponentType, PagingInputType, UserVertexType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { useQuery, useReactiveVar } from "@apollo/client";
import { MY_PROFILE } from "@/graphql/documentNodes";
import AjaxFeedback from "@/components/AjaxFeedback";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import Layout from "@/components/Layout";
import Head from "next/head";
import dynamic from "next/dynamic";
import config from "../config";
import PageIntro from "@/components/PageIntro";
import TabTitle from "@/components/TabTitle";

const ProfileSection = dynamic(() => import("components/ProfileSection"), {
    loading: () => <AjaxFeedback loading />,
  }),
  CommentsSection = dynamic(() => import("components/CommentsSection"), {
    loading: () => <AjaxFeedback loading />,
  }),
  ProductsSection = dynamic(() => import("components/ProductsSection"), {
    loading: () => <AjaxFeedback loading />,
  }),
  RequestsSection = dynamic(() => import("components/RequestsSection"), {
    loading: () => <AjaxFeedback loading />,
  }),
  OrdersSection = dynamic(() => import("components/OrdersSection"), {
    loading: () => <AjaxFeedback loading />,
  });

const { abbr, webPages } = config.appData,
  // dashboard page data
  dashboardPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "dashboard"
  ),
  // tab title style
  tabTitleStyle = { fontSize: 16 };

// dashboard component
const DashboardPage: AuthComponentType = () => {
  // use auth payload & access token
  const accessToken = useReactiveVar(accessTokenVar),
    // query user data
    {
      data: userData,
      loading: userLoading,
      fetchMore: fetchMoreUserData,
    } = useQuery<
      Record<"me", UserVertexType>,
      Record<
        "productArgs" | "commentArgs" | "orderArgs" | "requestArgs",
        PagingInputType
      >
    >(MY_PROFILE, {
      variables: {
        commentArgs: { last: 50 },
        orderArgs: { last: 20 },
        productArgs: { last: 20 },
        requestArgs: { last: 20 },
      },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

  if (userData?.me) {
    const {
      service: { orderCount, productCount, commentCount },
      requestCount,
    } = userData.me! as Required<UserVertexType>;

    return (
      <Layout>
        <Head>
          <title>
            {abbr} &trade; | {dashboardPage?.pageTitle}
          </title>
        </Head>
        <PageIntro
          pageTitle={
            <>
              <MdDashboardCustomize size={40} />
              {dashboardPage?.pageTitle}
            </>
          }
          paragraphs={dashboardPage?.parargraphs}
        />
        <Tabs defaultActiveKey="orders" className="my-5">
          <Tab
            eventKey="orders"
            title={<TabTitle countValue={orderCount ?? 0} />}
            className="my-5"
          >
            <OrdersSection />
          </Tab>
          <Tab
            eventKey="requests"
            title={<TabTitle countValue={requestCount ?? 0} />}
            className="my-5"
          >
            <RequestsSection />
          </Tab>
          <Tab
            eventKey="products"
            title={
              <h5 style={tabTitleStyle}>
                Products
                <Badge pill className="bg-info">
                  {getCompactNumberFormat(productCount!)}
                </Badge>
              </h5>
            }
            className="my-5"
          >
            <ProductsSection />
          </Tab>
          <Tab
            eventKey="comments"
            title={
              <h5 style={tabTitleStyle}>
                Comments
                <Badge pill className="bg-info">
                  {getCompactNumberFormat(commentCount!)}
                </Badge>
              </h5>
            }
            className="my-5"
          >
            <CommentsSection />
          </Tab>
          <Tab
            eventKey="profile"
            title={<h5 style={tabTitleStyle}>Profile</h5>}
            className="my-5"
          >
            <ProfileSection />
          </Tab>
        </Tabs>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>
          {abbr} &trade; | {dashboardPage?.pageTitle}
        </title>
      </Head>
      <AjaxFeedback loading={userLoading} />
    </Layout>
  );
};

DashboardPage.audiences = ["user", "admin"];
DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
