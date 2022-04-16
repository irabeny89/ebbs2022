import Button from "react-bootstrap/Button";
import OrdersOrRequests from "./OrdersOrRequests";
import SortedListWithTabs from "./SortedListWithTabs";
import { useQuery, useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { REQUESTS_TAB } from "@/graphql/documentNodes";
import { PagingInputType, UserVertexType } from "types";
import AjaxFeedback from "./AjaxFeedback";

export default function RequestsSection() {
  const accessToken = useReactiveVar(accessTokenVar),
    { data, error, loading, fetchMore } = useQuery<
      Record<"me", UserVertexType>,
      Record<"requestArgs", PagingInputType>
    >(REQUESTS_TAB, {
      variables: {
        requestArgs: { last: 25 },
      },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

  return loading ? (
    <AjaxFeedback loading={loading} error={error} />
  ) : (
    <>
      <SortedListWithTabs
        tabsVariantStyle="pills"
        className=""
        ListRenderer={OrdersOrRequests}
        field="state"
        list={data?.me?.requests?.edges?.map((edge) => edge.node) ?? []}
        rendererProps={{
          className: "pt-4 rounded",
          asRequestList: true,
          title: data?.me?.service?.title,
        }}
      />
      {data?.me?.requests?.pageInfo?.hasNextPage && (
        <Button
          size="lg"
          onClick={() =>
            fetchMore({
              variables: {
                requestArgs: {
                  last: 20,
                  before: data?.me?.requests?.pageInfo?.endCursor,
                },
              },
            })
          }
        >
          See more
        </Button>
      )}
    </>
  );
}
