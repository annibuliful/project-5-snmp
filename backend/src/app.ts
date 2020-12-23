import Fastify, { FastifyInstance } from "fastify";
import { Socket, Server } from "socket.io";
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

setInterval(async () => {
  try {
    const snmpResult = await snmpUtil(oids);
    const data = { id: nanoid(), ...snmpResult[0] };
    db.get("results")
      .push(data)
      .write();

    console.log("snmp result", snmpResult);
  } catch (e) {
    console.error(e);
  }
}, 1000);

const fastify: FastifyInstance = Fastify({
  logger
});

const io = new Server(fastify.server);
io.on("connection", function(socket: Socket) {
  console.log("New Connection from Client");
  socket.on("message", function() {});
  socket.on("disconnect", function() {});
});

fastify.register(require("fastify-cors"), {});
fastify.register(require("fastify-compress"));

export default async (port: number) => {
  try {
    await fastify.listen(port);
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

    fastify.log.info(`server listening on ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
