import snmp from "net-snmp";

const session = snmp.createSession("127.0.0.1", "public");
export const snmpUtil = (listOids: string[]) => {
  session.get(listOids, function (error, varbinds) {
    console.log("get Request");
    if (error) {
      console.error(error);
    } else {
      for (let i = 0; i < varbinds.length; i++) {
        if (snmp.isVarbindError(varbinds[i])) {
          console.error(snmp.varbindError(varbinds[i]));
        } else {
          console.log(varbinds[i].oid + " = " + varbinds[i].value);
        }
      }
    }
    // session.close();
    console.log("\n");
  });

  session.getNext(listOids, function (error, varbinds) {
    console.log("get Next Request");
    if (error) {
      console.error(error.toString());
    } else {
      for (let i = 0; i < varbinds.length; i++) {
        // for version 1 we can assume all OIDs were successful
        console.log(varbinds[i].oid + " | " + varbinds[i].value);

        // for version 2c we must check each OID for an error condition
        if (snmp.isVarbindError(varbinds[i]))
          console.error(snmp.varbindError(varbinds[i]));
        else console.log(varbinds[i].oid + " | " + varbinds[i].value);
      }
    }
    console.log("\n");
  });

  const nonRepeaters = 0;
  const maxRepeations = 10000;
  session.getBulk(
    listOids,
    nonRepeaters,
    maxRepeations,
    function (error, varbinds) {
      console.log("get bulk Request");

      if (error) {
        console.error(error.toString());
      } else {
        // step through the non-repeaters which are single varbinds
        for (let i = 0; i < nonRepeaters; i++) {
          if (i >= varbinds.length) break;

          if (snmp.isVarbindError(varbinds[i])) {
            console.error(snmp.varbindError(varbinds[i]));
          } else {
            console.log(varbinds[i].oid + " | " + varbinds[i].value);
          }
        }

        // then step through the repeaters which are varbind arrays
        for (let i = nonRepeaters; i < varbinds.length; i++) {
          for (let j = 0; j < varbinds[i].length; j++) {
            if (snmp.isVarbindError(varbinds[i][j])) {
              console.error(snmp.varbindError(varbinds[i][j]));
            } else {
              console.log(varbinds[i][j].oid + " | " + varbinds[i][j].value);
            }
          }
        }
      }
      console.log("\n");
    }
  );

  session.trap(snmp.TrapType.LinkDown, function (error) {
    if (error) console.error(error);
  });
};
