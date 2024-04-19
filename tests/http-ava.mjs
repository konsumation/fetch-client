import test from "ava";
import { startServer, stopServer } from "./helpers/server.mjs";

let port = 3151;

test.beforeEach(t => startServer(t, port++));
test.afterEach.always(t => stopServer(t));

test("list categories", async t => {
  const response = await fetch(`${t.context.url}/category`, {
    headers: { Authorization: `Bearer ${t.context.token}` }
  });

  t.is(response.statusCode, 200);
});
