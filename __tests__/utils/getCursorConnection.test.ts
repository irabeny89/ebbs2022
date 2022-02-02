import { getCursorConnection } from "../../utils/";

const list = Array.from({ length: 5 }).map((_, i) => ({
  name: "A" + i,
  createdAt: new Date(Date.now() + 1e3 * i),
}));

describe("getCursorConnection", () => {
  it("should return cursor connection with first 1 item", () => {
    const cursorConnection = getCursorConnection({
      list,
      first: 1,
    });

    expect(cursorConnection.edges).toHaveLength(1);
    expect(cursorConnection.edges[0].node).toHaveProperty("name", "A0");
  });

  it("should return cursor connection with first 2 items", () => {
    const cursorConnection = getCursorConnection({
      list,
      first: 2,
    });

    expect(cursorConnection.edges).toHaveLength(2);
    expect(cursorConnection.edges[0].node).toHaveProperty("name", "A0");
    expect(cursorConnection.edges[1].node).toHaveProperty("name", "A1");
  });
  
  it("should return cursor connection with first 2 items after the 3rd item", () => {
    const cursorConnection = getCursorConnection({
      list,
      first: 2,
      after: list[2].createdAt,
    });

    expect(cursorConnection.edges).toHaveLength(2);
    expect(cursorConnection.edges[0].node).toHaveProperty("name", "A3");
    expect(cursorConnection.edges[1].node).toHaveProperty("name", "A4");
  });

  it("should return cursor connection with last 1 item", () => {
    const cursorConnection = getCursorConnection({
      list,
      last: 1,
    });
    
    expect(cursorConnection.edges).toHaveLength(1);
    expect(cursorConnection.edges[0].node).toHaveProperty("name", "A4");
  });

  it("should return cursor connection with last 2 items", () => {
    const cursorConnection = getCursorConnection({
      list,
      last: 2,
    });

    expect(cursorConnection.edges).toHaveLength(2);
    expect(cursorConnection.edges[0].node).toHaveProperty("name", "A3");
    expect(cursorConnection.edges[1].node).toHaveProperty("name", "A4");
  });

  it("should return cursor connection with last 2 items before the 4th item", () => {
    const cursorConnection = getCursorConnection({
      list,
      last: 2,
      before: list[3].createdAt,
    });

    expect(cursorConnection.edges).toHaveLength(2);
    expect(cursorConnection.edges[0].node).toHaveProperty("name", "A1");
    expect(cursorConnection.edges[1].node).toHaveProperty("name", "A2");
  });
});
