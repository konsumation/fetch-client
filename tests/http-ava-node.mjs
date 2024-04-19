import test from "ava";
import { startServer, stopServer } from "./helpers/server.mjs";
import { Master} from "@konsumation/model";
import { sync } from "@konsumption/fetch-client";

let port = 3151;

test.beforeEach(t => startServer(t, port++));
test.afterEach.always(t => stopServer(t));

test("sync categories", async t => {
  const master = await Master.initialize({});

  const options = {
    headers: { Authorization: `Bearer ${t.context.token}` }
  };

  await sync(master, t.context.url, options);

 // const response = await fetch(`${t.context.url}/category`, );


 // t.is(response.status, 200);
});
