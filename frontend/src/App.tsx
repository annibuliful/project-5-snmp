import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./App.css";
import useSocket from "use-socket.io-client";
import { format, getMinutes } from "date-fns";
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
  ip: string;
}

interface ISummaryData {
  rate: number;
  average: number;
  max: number;
  min: number;
}

const App = () => {
  //You can treat "useSocket" as "io"
  const [socket] = useSocket(ENDPOINT, {
    autoConnect: false,
  });

  const [dataSummary, setDataSummary] = useState<ISummaryData>({
    rate: 0,
    average: 0,
    max: 0,
    min: -1,
  });

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
  // const [dataChart, setDataChart] = useState({
  //   labels: ["Current", "Average", "Maximum", "Minimum"],
  //   datasets: [
  //     {
  //       label: "SNMP DataSet",
  //       fill: false,
  //       lineTension: 0.1,
  //       backgroundColor: "rgba(75,192,192,0.4)",
  //       borderColor: "rgba(75,192,192,1)",
  //       borderCapStyle: "butt",
  //       borderDash: [],
  //       borderDashOffset: 0.0,
  //       borderJoinStyle: "miter",
  //       pointBorderColor: "rgba(75,192,192,1)",
  //       pointBackgroundColor: "#fff",
  //       pointBorderWidth: 1,
  //       pointHoverRadius: 5,
  //       pointHoverBackgroundColor: "rgba(75,192,192,1)",
  //       pointHoverBorderColor: "rgba(220,220,220,1)",
  //       pointHoverBorderWidth: 2,
  //       pointRadius: 1,
  //       pointHitRadius: 10,
  //       data: [0, 0, 0, 0],
  //     },
  //   ],
  // });

  const [transferRateChart, setTransferRateChart] = useState({
    labels: [],
    datasets: [
      {
        label: "SNMP Data transfer",
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
        data: [],
      },
    ],
  });

  const onUpdateSummaryData = (data: IReportData) => {
    const newData: ISummaryData = dataSummary;

    if (newData["min"] === -1) {
      newData["min"] = data.value;
    } else {
      if (newData["min"] > data.value) {
        newData["min"] = data.value;
      }
    }

    if (newData["max"] < data.value) {
      newData["max"] = data.value;
    }

    newData["average"] = data.average;
    newData["rate"] = data.rate;

    setDataSummary(newData);
  };
  const onUpdateTransferRate = (timeStamp: string, value: number) => {
    const labelMinute = Math.floor(getMinutes(new Date(timeStamp)) / 10);
    // const label = `${format(new Date(timeStamp), "d MMM yyyy")}-${labelMinute}`;
    const label = timeStamp;
    setTransferRateChart((prev) => {
      const listLabels = prev.labels;
      const labelIndex = listLabels.findIndex((el) => el === label);
      const temp = Object.assign(prev);
      if (labelIndex === -1) {
        temp.labels = [...temp.labels, label];
        temp.datasets[0].data = [...temp.datasets[0].data, value];
      } else {
        temp.datasets[0].data[labelIndex] = value;
      }
      return temp;
    });
  };

  // add event
  useEffect(() => {
    //connect socket
    socket.connect();
    socket.on("message", (data: IReportData) => {
      onUpdateTransferRate(data.createdAt, data.value);
      onUpdateSummaryData(data);
      // setDataChart((prev) => ({
      //   ...prev,
      //   datasets: [
      //     {
      //       ...prev.datasets[0],
      //       data: [data.rate, data.average, data.max, 0],
      //     },
      //   ],
      // }));

      setListData((prev) => [data, ...prev]);
    });
  }, [socket]);

  return (
    <div className="App">
      {/* <Line
        data={dataChart}
        width={100}
        height={400}
        options={{ maintainAspectRatio: false }}
      /> */}
      <Line data={transferRateChart} />

      <h4 style={{ marginTop: "20px" }}>Summary</h4>
      <div style={{ margin: "20px auto", width: "20vw" }}>
        {Object.keys(dataSummary).map((key) => {
          return (
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)" }}
              key={key}
            >
              <p>{key}</p>
              <p>{dataSummary[key]}</p>
            </div>
          );
        })}
      </div>
      <h4 style={{ marginTop: "20px" }}>Report Table</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6,1fr)",
          margin: "0 auto",
          width: "80vw",
        }}
      >
        <div style={{ border: "1px solid gray", padding: "20px" }}>OID</div>
        <div style={{ border: "1px solid gray", padding: "20px" }}>IP</div>
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
      <div style={{ height: "50vh", overflow: "scroll" }}>
        {listData.map(({ oid, name, value, rate, createdAt, ip }) => (
          <div
            key={createdAt}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              width: "80vw",
              margin: "0 auto",
            }}
          >
            <div style={{ border: "1px solid gray" }}>{oid}</div>
            <div style={{ border: "1px solid gray" }}>{ip}</div>
            <div style={{ border: "1px solid gray" }}>{name}</div>
            <div style={{ border: "1px solid gray" }}>{rate}</div>
            <div style={{ border: "1px solid gray" }}>{value}</div>
            <div style={{ border: "1px solid gray" }}>{createdAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
