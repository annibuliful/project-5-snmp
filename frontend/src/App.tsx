import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./App.css";
import useSocket from "use-socket.io-client";
const ENDPOINT = "http://localhost:3030";

interface IReportData {
  id: string;
  oid: string;
  name: string;
  value: number;
  rate: number;
  average: number;
  max: number;
  counter: number;
  createdAt: string;
}
const App = () => {
  //You can treat "useSocket" as "io"
  const [socket] = useSocket(ENDPOINT, {
    autoConnect: false,
  });

  //connect socket
  socket.connect();

  const [listData, setListData] = useState<IReportData[]>([
    // {
    //   id: "_t5hv6Ik_Rt_UuAdEy2jH",
    //   oid: "1.3.6.1.2.1.4.3.0",
    //   name: "Inbound",
    //   value: 3994056,
    //   rate: 0,
    //   average: 0,
    //   max: 0,
    //   counter: 0,
    //   createdAt: "2020-12-23T13:54:14.103Z",
    // },
  ]);
  const [dataChart, setDataChart] = useState({
    labels: ["Current", "Average", "Maximum", "Minimum"],
    datasets: [
      {
        label: "SNMP DataSet",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [0, 0, 0, 0],
      },
    ],
  });

  // add event
  socket.on("message", (data: IReportData) => {
    setDataChart((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: [data.rate, data.average, data.max, 0],
        },
      ],
    }));

    setListData((prev) => [...prev, data]);
  });
  return (
    <div className="App">
      <Line
        data={dataChart}
        width={100}
        height={400}
        options={{ maintainAspectRatio: false }}
      />
      <h4 style={{ marginTop: "20px" }}>Report Table</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          margin: "0 auto",
          width: "80vw",
        }}
      >
        <div style={{ border: "1px solid gray", padding: "20px" }}>OID</div>
        <div style={{ border: "1px solid gray", padding: "20px" }}>Name</div>
        <div style={{ border: "1px solid gray", padding: "20px" }}>
          Transfer Rate
        </div>
        <div style={{ border: "1px solid gray", padding: "20px" }}>
          Transfer Value
        </div>
        <div style={{ border: "1px solid gray", padding: "20px" }}>
          Timestamp
        </div>
      </div>
      {listData.map(({ oid, name, value, rate, createdAt }) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            width: "80vw",
            margin: "0 auto",
          }}
        >
          <div style={{ border: "1px solid gray" }}>{oid}</div>
          <div style={{ border: "1px solid gray" }}>{name}</div>
          <div style={{ border: "1px solid gray" }}>{rate}</div>
          <div style={{ border: "1px solid gray" }}>{value}</div>
          <div style={{ border: "1px solid gray" }}>{createdAt}</div>
        </div>
      ))}
    </div>
  );
};

export default App;
