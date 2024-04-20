import test from "ava";
import { fileURLToPath } from "node:url";
import { startServer, stopServer } from "./helpers/server.mjs";
import Master from "@konsumation/db-level";
import { sync } from "@konsumation/fetch-client";

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
  const master = await Master.initialize(t.context.databaseFile + 'client');

  const options = {
    headers: { Authorization: `Bearer ${t.context.token}` }
  };

  await sync(master, t.context.url, options);

  const lines = [];

  for await (const line of master.text(master.context)) {
    lines.push(line);
 //   console.log(line);
  }

   t.true(lines.length > 30);
});
