import * as React from "react";
import * as Mui from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import randomColor from "randomcolor";

const API_KEY = "5b76a0aef20ac58263f0827068b37e59";

export default function Chart(props) {
  const [options, setOptions] = React.useState({
    chart: {
      type: "spline",
    },
    title: {
      text: `Index ${props.symbols[0]} vs Index ${props.symbols[1]} Chart(SD: ${props.sd}, R: ${props.r})`,
    },
    xAxis: {
      type: "date",
      labels: {
        formatter: function () {
          return Highcharts.dateFormat("%b", this.value);
        },
      },
      plotLines: [],
    },
    yAxis: {
      title: {
        text: "%",
      },
    },
    tooltip: {
      split: true,
      formatter: function () {
        return [
          "<br>" + Highcharts.dateFormat("%b/%d/%Y", this.x) + "</br>",
        ].concat(
          this.points
            ? this.points.map(
                (point) => point.series.name + " <b>" + point.y + "%</b>"
              )
            : []
        );
      },
    },
    series: [],
  });

  // difference chart options
  const [dOptions, setDOptions] = React.useState({
    chart: {
      type: "spline",
    },
    title: {
      text: "Difference Chart",
    },
    xAxis: {
      type: "date",
      labels: {
        formatter: function () {
          return Highcharts.dateFormat("%b", this.value);
        },
      },
      plotLines: [],
    },
    yAxis: {
      title: {
        text: "%",
      },
    },
    tooltip: {
      split: true,
      formatter: function () {
        return [
          "<br>" + Highcharts.dateFormat("%b/%d/%Y", this.x) + "</br>",
        ].concat(
          this.points
            ? this.points.map(
                (point) => point.series.name + " <b>" + point.y + "%</b>"
              )
            : []
        );
      },
    },
    series: [],
  });

  const [mulSDs, setMulSDs] = React.useState([
    {
      mul: "2",
      color: "#0096FF",
    },
    {
      mul: "3",
      color: "#FF0000",
    },
  ]);

  const [indexes, setIndexes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [firstA, setFirstA] = React.useState(0);
  const [firstB, setFirstB] = React.useState(0);
  const [maxDifferencePercent, setMaxDifferencePercent] = React.useState(0);
  const [minDifferencePercent, setMinDifferencePercent] = React.useState(0);
  const timer = React.useRef(null);

  const getIndexInfo = React.useCallback(async () => {
    setLoading(true);
    let multiSeries = [];
    try {
      let from = props.from;
      let to = props.to;

      for (let i = 0; i < props.symbols.length; i++) {
        let series = {
          data: [],
          name: props.symbols[i],
          color: randomColor(),
        };
        const result = await axios.get(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${props.symbols[
            i
          ].replace(
            "^",
            "%5E"
          )}?apikey=5b76a0aef20ac58263f0827068b37e59&from=${from}&to=${to}`
        );
        // index info
        let indexInfo = result.data.historical;

        // sort
        indexInfo.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
        // first close value - day1
        const firstDayClose = indexInfo[0].close;

        if (i === 0) {
          setFirstA(indexInfo[0].close);
        }

        if (i === 1) {
          setFirstB(indexInfo[0].close);
        }

        // create series
        indexInfo.forEach((historical) => {
          series.data.push([
            new Date(historical.date).getTime(),

            ((historical.close - firstDayClose) / firstDayClose) * 100,
          ]);
        });
        multiSeries.push(series);
      }

      // calc SD
      const plotLines = [];
      let SD = 0;
      if (multiSeries.length > 1) {
        const differencePercent = [];
        const differenceDate = [];

        const first = multiSeries[0].data;
        const second = multiSeries[1].data;

        for (let i = 0; i < first.length; i++) {
          let found = second.find((ele) => ele[0] === first[i][0]);
          if (found) {
            differencePercent.push(first[i][1] - found[1]);
            differenceDate.push(found[0]);
          }
        }

        // SD
        const n = differencePercent.length;
        const mean = differencePercent.reduce((a, b) => a + b) / n;

        setMaxDifferencePercent(Math.max(...differencePercent));
        setMinDifferencePercent(Math.min(...differencePercent));

        SD = Math.sqrt(
          differencePercent
            .map((x) => Math.pow(x - mean, 2))
            .reduce((a, b) => a + b) / n
        );

        // multi SD
        mulSDs.sort(
          (a, b) => Number.parseFloat(a.mul) - Number.parseFloat(b.mul)
        );
        const randomRedColor = randomColor({
          count: mulSDs.length,
          hue: "blue",
        });
        randomRedColor.sort((a, b) => b - a);

        const lightBlue = "#0096FF";
        const red = "#FF0000";

        mulSDs.forEach((mulSD, index) => {
          if (index === 0) mulSD.color = lightBlue;
          else if (index === 1) mulSD.color = red;
          else mulSD.color = randomColor();
          for (let i = 0; i < n; i++) {
            if (Math.abs(differencePercent[i]) >= mulSD.mul * SD) {
              if (
                plotLines.find(
                  (plotLine) => plotLine.value === differenceDate[i]
                ) === undefined
              ) {
                plotLines.push({
                  value: differenceDate[i],
                  color: mulSD.color,
                  dashStyle: "dash",
                  width: 1,
                });
              } else {
                const found = plotLines.find(
                  (plotLine) => plotLine.value === differenceDate[i]
                );
                const index = plotLines.indexOf(found);
                plotLines[index].color = mulSD.color;
              }
            }
          }
        });

        // difference series
        const differenceSeries = {
          data: [],
          name: "Diff",
          color: randomColor(),
        };
        differencePercent.forEach((differencePercent, index) => {
          differenceSeries.data.push([
            new Date(differenceDate[index]).getTime(),
            differencePercent,
          ]);
        });

        setDOptions((dOptions) => ({
          ...dOptions,
          title: {
            text: `Difference Chart <br /> (${props.symbols[0]} vs ${props.symbols[1]})`,
          },
          series: [differenceSeries],
          xAxis: {
            split: true,
            type: "date",
            labels: {
              formatter: function () {
                return Highcharts.dateFormat("%b/%d/%y", this.value);
              },
            },
            plotLines: plotLines,
          },
        }));
      }

      setOptions((options) => ({
        ...options,
        title: {
          text: `Index ${props.symbols[0]} vs Index ${
            props.symbols[1]
          } Chart<br />(SD: ${SD.toFixed(3)}, R: ${props.r.toFixed(3)})`,
        },
        series: multiSeries,
        xAxis: {
          type: "date",
          labels: {
            formatter: function () {
              return Highcharts.dateFormat("%b/%d/%y", this.value);
            },
          },
          plotLines: plotLines,
        },
      }));
      setLoading(false);
    } catch (error) {
      throw error;
    }
  }, [mulSDs, props]);

  React.useEffect(() => {
    axios
      .get(
        `https://financialmodelingprep.com/api/v3/quotes/index?apikey=${API_KEY}`
      )
      .then((indexes) => {
        // remove empty Indexes
        indexes.data = indexes.data.filter(
          (index) =>
            index.symbol !== "^RUI" &&
            index.symbol !== "TXBA.TS" &&
            index.symbol !== "^NOMUC.SR"
        );
        setIndexes(indexes.data);
      });
  }, []);

  const handleMulSDTagChange = React.useCallback((e, tags) => {
    let mulSDs = [];
    tags.map((tag) => mulSDs.push({ mul: tag, color: randomColor() }));
    setMulSDs(mulSDs);
  }, []);

  React.useEffect(() => {
    if (props.symbols.length) {
      getIndexInfo();
    }
  }, [props.symbols, getIndexInfo]);

  const getIndexInfoByMinute = React.useCallback(async () => {
    if (firstA === 0 || firstB === 0) return;

    const indexA = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${props.symbols[0].replace(
        "^",
        "%5E"
      )}?apikey=5b76a0aef20ac58263f0827068b37e59`
    );

    const indexB = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${props.symbols[1].replace(
        "^",
        "%5E"
      )}?apikey=5b76a0aef20ac58263f0827068b37e59`
    );

    const percentA = ((indexA.data[0].price - firstA) / firstA) * 100;
    const percentB = ((indexB.data[0].price - firstB) / firstB) * 100;

    console.log("percent", percentB, percentA);

    const plotLineY = [
      {
        value: percentA - percentB,
        color: "#f97316",
        width: 1,
        label: {
          text: percentA - percentB,
          align: "center",
        },
      },
    ];

    const diff = percentA - percentB;
    const min = Math.min(diff, minDifferencePercent);
    const max = Math.max(diff, maxDifferencePercent);

    setDOptions((dOptions) => ({
      ...dOptions,
      yAxis: {
        title: {
          text: "%",
        },
        plotLines: plotLineY,
        max: max,
        min: min,
      },
    }));
  }, [
    firstA,
    firstB,
    maxDifferencePercent,
    minDifferencePercent,
    props.symbols,
  ]);

  React.useEffect(() => {
    getIndexInfoByMinute();
    timer.current = window.setInterval(getIndexInfoByMinute, 60000);
    return () => {
      window.clearInterval(timer.current);
    };
  }, [getIndexInfoByMinute]);

  const DChart = React.useMemo(() => {
    return (
      props.symbols.length === 2 && (
        <HighchartsReact highcharts={Highcharts} options={dOptions} />
      )
    );
  }, [dOptions, props.symbols.length]);

  return (
    <Mui.Container maxWidth="false" sx={{ paddingTop: 5, paddingX: 1 }}>
      {indexes.length && (
        <Mui.Stack spacing={5}>
          <Mui.Grid container>
            <Mui.Grid item xs={12} sm={12} md={4}>
              <Mui.Autocomplete
                multiple
                fullWidth
                id="tags-mulSD"
                options={mulSDs.map((mulSD) => mulSD.mul)}
                defaultValue={[mulSDs[0].mul, mulSDs[1].mul]}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Mui.Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      disabled={option === "2" || option === "3"}
                    />
                  ))
                }
                renderInput={(params) => (
                  <Mui.TextField
                    {...params}
                    type="number"
                    variant="outlined"
                    label="xSD"
                    placeholder="Enter custom multi"
                  />
                )}
                onChange={handleMulSDTagChange}
              />
            </Mui.Grid>
          </Mui.Grid>
          {loading === true ? (
            <Mui.Box
              sx={{ display: "flex", justifyContent: "center", padding: 2 }}
            >
              <Mui.CircularProgress />
            </Mui.Box>
          ) : (
            <div>
              <HighchartsReact highcharts={Highcharts} options={options} />
              {DChart}
            </div>
          )}
        </Mui.Stack>
      )}
    </Mui.Container>
  );
}
