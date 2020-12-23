import Fastify, { FastifyInstance } from "fastify";

import { nanoid } from "nanoid";

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// import { JsonDB } from "node-json-db";
// import { Config } from "node-json-db/dist/lib/JsonDBConfig";
// var db = new JsonDB(new Config("myDataBase", true, false, "/"));
// const knex = require("knex")({
//   client: "sqlite3",
//   connection: {
//     filename: "./db.sqlite3"
//   },
//   useNullAsDefault: true
// });
import logger from "./logger";
import { snmpUtil } from "./snmp";
// "1.3.6.1.2.1.4.20.1.20"
const oids = ["1.3.6.1.2.1.4.3.0"];

const fastify: FastifyInstance = Fastify({
  logger,
});

const io = require("socket.io")(fastify.server, {
  // transports: ['websocket'],
});

fastify.register(require("fastify-cors"), {});
fastify.register(require("fastify-compress"));

export default async (port: number) => {
  io.on("connection", function (socket) {
    console.log("connection");
    socket.on("message", (message) => {
      socket.broadcast.emit("message", message);
    });
    socket.on("disconnect", function () {});
  });

  try {
    await fastify.listen(port, "0.0.0.0");
    //
    // knex.schema.createTable("todos", function(table) {
    //   table.increments();
    //   table.string("oid");
    //   table.string("name");
    //   table.integer("value");
    //   table.integer("rate");
    //   table.integer("average");
    //   table.integer("max");
    //   table.integer("counter");
    // });

    setInterval(async () => {
      try {
        const snmpResult = await snmpUtil(oids);
        const data = { id: nanoid(), ...snmpResult[0] };
        db.get("results").push(data).write();
        io.emit("report", data);
        // console.log("snmp result", snmpResult);
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
