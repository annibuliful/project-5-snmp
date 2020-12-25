import snmp from "net-snmp";

// session.getNext(listOids, function(error, varbinds) {
//   console.log("get Next Request");
//   if (error) {
//     console.error(error.toString());
//   } else {
//     for (let i = 0; i < varbinds.length; i++) {
//       // for version 1 we can assume all OIDs were successful
//       console.log(varbinds[i].oid + " | " + varbinds[i].value);
//
//       // for version 2c we must check each OID for an error condition
//       if (snmp.isVarbindError(varbinds[i]))
//         console.error(snmp.varbindError(varbinds[i]));
//       else console.log(varbinds[i].oid + " | " + varbinds[i].value);
//     }
//   }
//   console.log("\n");
// });
//
// const nonRepeaters = 0;
// const maxRepeations = 10000;
// session.getBulk(listOids, nonRepeaters, maxRepeations, function(
//   error,
//   varbinds
// ) {
//   console.log("get bulk Request");
//
//   if (error) {
//     console.error(error.toString());
//   } else {
//     // step through the non-repeaters which are single varbinds
//     for (let i = 0; i < nonRepeaters; i++) {
//       if (i >= varbinds.length) break;
//
//       if (snmp.isVarbindError(varbinds[i])) {
//         console.error(snmp.varbindError(varbinds[i]));
//       } else {
//         console.log(varbinds[i].oid + " | " + varbinds[i].value);
//       }
//     }
//
//     // then step through the repeaters which are varbind arrays
//     for (let i = nonRepeaters; i < varbinds.length; i++) {
//       for (let j = 0; j < varbinds[i].length; j++) {
//         if (snmp.isVarbindError(varbinds[i][j])) {
//           console.error(snmp.varbindError(varbinds[i][j]));
//         } else {
//           console.log(varbinds[i][j].oid + " | " + varbinds[i][j].value);
//         }
//       }
//     }
//   }
//   console.log("\n");
// });
const results = [];
const user = {
  name: "admin-management",
};

const list = [
  "192.168.100.2",
  "192.168.100.1",
  "192.168.200.1",
  "192.168.200.2",
  "10.99.1.2",
  // "127.0.0.1",
];

const randomIp = () => list[Math.floor(Math.random() * list.length)];

export const snmpUtil = (listOids: string[], ip: string) => {
  // const session = snmp.createSession(ip, "management");
  const session = snmp.createSession(ip, "public");

  return new Promise((resolve, reject) => {
    session.get(listOids, function (error, varbinds) {
      // console.log("get Request");
      if (error) {
        console.error(error);
        reject(error);
      } else {
        for (var i = 0; i < varbinds.length; i++) {
          if (snmp.isVarbindError(varbinds[i])) {
            console.error(snmp.varbindError(varbinds[i]));
          } else {
            //console.log (varbinds[i].oid + " = " + varbinds[i].value);

            let result = results.find((el) => el.oid == varbinds[i].oid);
            if (result == undefined) {
              let name: string;

              if (varbinds[i].oid == listOids[0]) {
                name = "Inbound";
              } else {
                name = "Outbound";
              }

              result = new Object();
              result.oid = varbinds[i].oid;
              result.name = name;
              result.value = varbinds[i].value;
              result.rate = 0;
              result.average = 0;
              result.max = 0;
              result.counter = 0;
              result.ip = ip;
              results.push(result);
            } else {
              result.counter++;
              const oldValue = result.value;
              result.value = varbinds[i].value;
              if (result.value > varbinds[i].value) {
                //Integer number has wrapped for 32bit number
                // console.log("Wrapped");
                result.rate = (4294967295 - oldValue + result.value) / 1024;
              } else {
                result.rate = Math.round((result.value - oldValue) / 1024);
              }
              //Set the high water mark.
              if (result.rate > result.max || result.counter > 5) {
                result.max = result.rate;
                result.counter = 0;
              }
              //Now take an average
              result.average = Math.round((result.average + result.value) / 2);
            }
            result.createdAt = new Date();
          }
        }
      }
      resolve(results);
      // session.close();
      // console.log("\n");
    });

    session.trap(snmp.TrapType.LinkDown, function (error) {
      if (error) {
        console.error(error);
        reject(error);
      }
    });
  });
};
