import Fastify, { FastifyInstance } from "fastify";

import { nanoid } from "nanoid";

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);
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

const callSnmp = async (ip: string) => {
  const snmpResult = await snmpUtil(oids, ip);
  const data = { id: nanoid(), ...snmpResult[0] };
  console.log("data", data);
  // db.get("results").push(data).write();
  io.emit("message", data);
};

export default async (port: number) => {
  io.on("connection", function (socket) {
    socket.on("disconnect", function () {});
  });

  try {
    await fastify.listen(port, "0.0.0.0");
    const list = [
      // "192.168.100.2",
      // "192.168.100.1",
      // "192.168.200.1",
      // "192.168.200.2",
      // "10.99.1.2",
      "127.0.0.1",
      // "192.168.43.100",
      // "192.168.43.90",
      // "192.168.43.107",
      // "192.168.43.45",
    ];

    setInterval(() => {
      console.log("call", list[0]);
      callSnmp(list[0]);
    }, 5000);
    // setInterval(() => {
    //   console.log("call", list[1]);

    //   callSnmp(list[1]);
    // }, 5000);
    // setInterval(() => {
    //   console.log("call", list[2]);

    //   callSnmp(list[2]);
    // }, 5000);
    // setInterval(() => {
    //   console.log("call", list[3]);

    //   callSnmp(list[3]);
    // }, 5000);
    // setInterval(() => {
    //   console.log("call", list[4]);

    //   callSnmp(list[4]);
    // }, 5000);
    // list.forEach((el) =>
    //   setInterval(() => {
    //     callSnmp(el);
    //   }, 1000)
    // );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
