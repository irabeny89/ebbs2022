import Button from "react-bootstrap/Button";
import { useQuery, useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { PagingInputType, UserVertexType } from "types";
import { ORDERS_TAB } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import DashboardServiceAlert from "components/DashboardServiceAlert";
import SortedListWithTabs from "./SortedListWithTabs";
import OrdersOrRequests from "./OrdersOrRequests";

export default function OrdersSection() {
  const accessToken = useReactiveVar(accessTokenVar),
    { data, loading, error, fetchMore } = useQuery<
      Record<"me", UserVertexType>,
      Record<"orderArgs", PagingInputType>
    >(ORDERS_TAB, {
      variables: {
        orderArgs: { last: 25 },
      },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

  return loading ? (
    <AjaxFeedback loading={loading} />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : !data?.me?.service?.title ? (
    <DashboardServiceAlert />
  ) : (
    <>
      <SortedListWithTabs
        className=""
        ListRenderer={OrdersOrRequests}
        field="state"
        list={data?.me?.service?.orders?.edges.map((edge) => edge.node) ?? []}
        rendererProps={{
          className: "pt-4 rounded",
        }}
        tabsVariantStyle="pills"
      />
      {data?.me?.service?.orders?.pageInfo?.hasNextPage && (
        <Button
          onClick={() =>
            fetchMore({
              variables: {
                orderArgs: {
                  last: 20,
                  before: data?.me?.service?.orders?.pageInfo?.endCursor,
                },
              },
            })
          }
          size="lg"
        >
          See more
        </Button>
      )}
    </>
  );
}
