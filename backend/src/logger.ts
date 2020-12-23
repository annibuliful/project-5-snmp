import pino from "pino";
export default pino({
  prettyPrint: {
    colorize: true,
    levelFirst: true
  },
  base: {}
});
