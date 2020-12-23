import Fastify, { FastifyInstance } from "fastify";
import { Socket, Server } from "socket.io";
import logger from "./logger";
import { snmpUtil } from "./snmp";
// "1.3.6.1.2.1.4.20.1.20"
const oids = ["1.3.6.1.2.1.4.3.0"];
snmpUtil(oids);
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

fastify.get("/ping", async () => {
  return { pong: "it worked!" };
});

export default async (port: number) => {
  try {
    await fastify.listen(port);

    fastify.log.info(`server listening on ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
