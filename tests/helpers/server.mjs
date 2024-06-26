import { readFileSync, createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { prepareHttpServer, prepareDatabase } from "@konsumation/konsum";

function pn(path) {
  return fileURLToPath(new URL(path, import.meta.url));
}

const sd = { notify: () => {}, listeners: () => [] };

const defaultUsers = {
  admin: {
    password: "start123",
    entitlements: [
      "konsum",
      "konsum.admin.backup",
      "konsum.admin.reload",
      "konsum.admin.stop",
      "konsum.category.get",
      "konsum.category.add",
      "konsum.category.modify",
      "konsum.category.delete",
      "konsum.value.get",
      "konsum.value.add",
      "konsum.value.delete",
      "konsum.meter.get",
      "konsum.meter.add",
      "konsum.meter.modify",
      "konsum.meter.delete",
      "konsum.note.get",
      "konsum.note.add",
      "konsum.note.modify",
      "konsum.note.delete"
    ]
  }
};

export async function createConfig(t, port = 3150, users = defaultUsers) {
  const configDir = pn(`../../build/config-${port}`);

  await mkdir(configDir, {
    recursive: true
  });

  const databaseFile = pn(`../../build/db-${port}`);
  const configFile = `${configDir}/config.json`;
  const config = {
    version: "1.2.3",
    database: {
      "@konsumation/db-level": databaseFile
    },
    auth: {
      jwt: {
        public: readFileSync(pn("./demo.rsa.pub")),
        private: readFileSync(pn("./demo.rsa")),
        options: {
          algorithm: "RS256"
        }
      },
      users: {
        ...users
      }
    },
    http: {
      port
    }
  };

  t.context.config = config;
  t.context.port = config.http.port;
  t.context.url = `http://localhost:${config.http.port}`;
  t.context.databaseFile = databaseFile;
  t.context.configDir = configDir;
  t.context.configFile = configFile;

  await writeFile(configFile, JSON.stringify(config, undefined, 2), "utf8");

  return config;
}

export async function startServer(t, port, users, dataFile) {
  const config = await createConfig(t, port, users);
  const { master } = await prepareDatabase(config);
  const { server } = await prepareHttpServer(config, sd, master);

  if (dataFile) {
    await master.fromText(createReadStream(dataFile, "utf8"));
  } else {
    await wait(50);
  }

  const response = await fetch(`http://localhost:${port}/authenticate`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      username: "admin",
      password: config.auth.users.admin.password
    })
  });

  t.context.token = (await response.json()).access_token;
  t.context.master = master;
  t.context.server = server;
}

export async function stopServer(t) {
  t.context.server.close();
  t.context.server.unref();
  await t.context.master.close();
  await rm(t.context.databaseFile, { recursive: true });
}

export async function wait(msecs = 1000) {
  await new Promise(resolve => setTimeout(resolve, msecs));
}
