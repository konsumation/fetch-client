import test from "ava";
import { fileURLToPath } from "node:url";
import { startServer, stopServer } from "./helpers/server.mjs";
import { Master } from "@konsumation/model";
import { sync } from "@konsumption/fetch-client";

let port = 3155;

test.beforeEach(t =>
  startServer(
    t,
    port++,
    undefined,
    fileURLToPath(
      new URL(
        "../node_modules/@konsumation/db-test/src/fixtures/database-version-3.txt",
        import.meta.url
      )
    )
  )
);
test.afterEach.always(t => stopServer(t));

test("sync categories", async t => {
  const master = await Master.initialize({});

  const options = {
    headers: { Authorization: `Bearer ${t.context.token}` }
  };

  await sync(master, t.context.url, options);

  // t.is(response.status, 200);
});
