import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { MdDashboardCustomize } from "react-icons/md";
import { AuthComponentType, UserVertexType } from "types";
import { useQuery, useReactiveVar } from "@apollo/client";
import { DASHBOARD } from "@/graphql/documentNodes";
import AjaxFeedback from "@/components/AjaxFeedback";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import Layout from "@/components/Layout";
import Head from "next/head";
import dynamic from "next/dynamic";
import config from "../config";
import PageIntro from "@/components/PageIntro";
import BadgedTitle from "components/BadgedTitle";

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
  }),
  DirectMessagesSection = dynamic(
    () => import("components/DirectMessagesSection"),
    {
      loading: () => <AjaxFeedback loading />,
    }
  );

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
    { data: userData, loading: userLoading } = useQuery<
      Record<"me", UserVertexType>
    >(DASHBOARD, {
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
        {/* TODO: change defaultActiveKey back to orders */}
        <Tabs defaultActiveKey="messages" className="my-5">
          <Tab
            eventKey="orders"
            title={<BadgedTitle label="Orders" countValue={orderCount ?? 0} />}
            className="my-5"
          >
            <OrdersSection />
          </Tab>
          <Tab
            eventKey="requests"
            title={
              <BadgedTitle label="Requests" countValue={requestCount ?? 0} />
            }
            className="my-5"
          >
            <RequestsSection />
          </Tab>
          <Tab
            eventKey="products"
            title={
              <BadgedTitle label="Products" countValue={productCount ?? 0} />
            }
            className="my-5"
          >
            <ProductsSection />
          </Tab>
          <Tab
            eventKey="comments"
            title={
              <BadgedTitle label="Comments" countValue={commentCount ?? 0} />
            }
            className="my-5"
          >
            <CommentsSection />
          </Tab>
          <Tab
            eventKey="profile"
            title={<BadgedTitle label="Profile" />}
            className="my-5"
          >
            <ProfileSection />
          </Tab>
          <Tab
            eventKey="messages"
            title={<BadgedTitle label="Messages" />}
            className="my-5"
          >
            <DirectMessagesSection />
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
