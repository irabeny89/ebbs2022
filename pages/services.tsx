import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import client from "@/graphql/apollo-client";
import { useLazyQuery } from "@apollo/client";
import { GetStaticProps } from "next";
import type {
  CursorConnectionType,
  ProductCategoryType,
  ServiceCardPropsType,
  ServiceReturnType,
  ServiceVariableType,
} from "types";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import { useRef } from "react";
import { FaBoxes } from "react-icons/fa";
import ServiceSection from "@/components/ServiceSection";
import { FEW_SERVICES } from "@/graphql/documentNodes";
import MoreButton from "@/components/MoreButton";
import PageIntro from "@/components/PageIntro";

// fetch web app meta data
const { webPages, abbr } = config.appData,
  // find products page data
  servicesPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "services"
  );

// get data at build time - ssg
export const getStaticProps: GetStaticProps = async () => {
    // fetch list
    const { data, error } = await client.query<
      ServiceReturnType,
      ServiceVariableType
    >({
      query: FEW_SERVICES,
      variables: {
        productArgs: {
          last: 10,
        },
        serviceArgs: {
          first: 25,
        },
      },
      fetchPolicy: "no-cache",
    });

    return error
      ? { notFound: true }
      : { props: data.services, revalidate: 15 };
  },
  // services page component
  ServicesPage = ({
    edges,
    pageInfo: { endCursor, hasNextPage },
  }: CursorConnectionType<ServiceCardPropsType>) => {
    // ref for lazy fetch flag
    const hasLazyFetched = useRef(false),
      // lazy fetch more products
      [fetchServices, { data, loading, fetchMore }] = useLazyQuery<
        ServiceReturnType,
        ServiceVariableType
      >(FEW_SERVICES, {
        variables: {
          serviceArgs: {
            first: 25,
            after: endCursor,
          },
          productArgs: {
            last: 10,
          },
        },
        notifyOnNetworkStatusChange: true,
      }),
      handleFetchMore = () =>
        fetchMore({
          variables: {
            serviceArgs: {
              first: 25,
              after: data?.services.pageInfo.endCursor,
            },
            productArgs: {
              last: 10,
            },
          },
        }),
      // omit cursor property from edge node
      services = [...edges, ...(data?.services.edges ?? [])]
        .map((edge) => edge.node)
        .filter((item) => item.products?.edges.length! > 0),
      categoryTabList = ["ALL"]
        .concat(...services.map((item) => item.categories!))
        // deduplicate categories
        .reduce(
          (prev: string[], cat) => (prev.includes(cat) ? prev : [...prev, cat]),
          []
        ),
      modifyList = (category: string) =>
        category === "ALL"
          ? (services as ServiceCardPropsType[])
          : (services.filter((item) =>
              item.categories!.includes(category as ProductCategoryType)
            ) as ServiceCardPropsType[]),
      showMoreButton = data
        ? data?.services?.pageInfo?.hasNextPage
        : hasNextPage;

    return (
      <Layout>
        <Head>
          <title>
            {abbr} | {servicesPage?.pageTitle}
          </title>
        </Head>
        <PageIntro
          pageTitle={
            <>
              <FaBoxes size="40" className="mb-2" /> {servicesPage?.pageTitle}
            </>
          }
          paragraphs={servicesPage?.parargraphs}
        />
        {/* category tabs 
          N.B - no need to use SortedListWithTabs component because it is incompatible with the requirements here.
          */}
        <Tabs id="category-tabs" defaultActiveKey="ALL">
          {/* render category as tabs */}
          {categoryTabList.map((category) => (
            <Tab title={category} eventKey={category} key={category}>
              <Row className="bg-danger my-0">
                <ServiceSection
                  className="pt-4 rounded"
                  // render filtered services based on product categories
                  items={modifyList(category)}
                />
              </Row>
            </Tab>
          ))}
        </Tabs>
        {showMoreButton && (
          <MoreButton
            {...{
              initialFetch: fetchServices,
              fetchMore: handleFetchMore,
              hasLazyFetched: (hasLazyFetched.current = !!data),
              label: "More services",
              loading,
            }}
          />
        )}
      </Layout>
    );
  };

export default ServicesPage;
