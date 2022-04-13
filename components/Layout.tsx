import { CSSProperties, useEffect } from "react";
import Container from "react-bootstrap/Container";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import type { LayoutPropsType } from "types";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import Header from "./Header";
import Footer from "./Footer";
// layout style
const mainStyle: CSSProperties = {
  minHeight: "90vh",
};
// layout component
export default function Layout({ children }: LayoutPropsType) {
  // on mount update cart items reactive variable from local storage
  useEffect(() => {
    cartItemsVar(getLastCartItemsFromStorage(localStorage));
  }, []);

  return (
    <Container fluid as="main">
      <Header />
      {/* dynamically add pages(children) to layout */}
      <main style={mainStyle}>{children}</main>
      <Footer />
    </Container>
  );
}
