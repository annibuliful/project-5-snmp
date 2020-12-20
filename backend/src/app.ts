import Fastify, { FastifyInstance } from "fastify";
import * as socketIO from "socket.io";
const fastify: FastifyInstance = Fastify({
  logger: true
});
const io = require("socket.io")(fastify.server);
io.on("connection", function(socket: any) {
  console.log("aaaa");
  socket.on("message", function() {});
  socket.on("disconnect", function() {});
});

fastify.register(require("fastify-cors"), {});
fastify.register(require("fastify-compress"));

fastify.get("/ping", async () => {
  return { pong: "it worked!" };
});

export default async () => {
  try {
    await fastify.listen(3000);

    fastify.log.info(`server listening on 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
