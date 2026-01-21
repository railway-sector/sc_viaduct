/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState, use } from "react";
import {
  bearingsLayer,
  buildingLayer,
  decksLayer,
  piersLayer,
  specialtyEquipmentLayer,
  stationLayer,
  stFoundationLayer,
  stFramingLayer,
  viaductLayer,
} from "../layers";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import "../App.css";
import {
  ChartDataRevit,
  construction_status,
  // contractPackage,
  generateChartData,
  generateTotalProgress,
  layerVisibleTrue,
  viatypes,
  zoomToLayer,
} from "../Query";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-tabs";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-button";
import {
  CalciteLabel,
  CalciteTabs,
  CalciteButton,
} from "@esri/calcite-components-react";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
// import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { MyContext } from "../contexts/MyContext";
import SubLayerView from "@arcgis/core/views/layers/BuildingComponentSublayerView";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

// Draw chart
const Chart = () => {
  const { contractpackages } = use(MyContext);
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const [progress, setProgress] = useState<any>([]);
  // const [selectedFeatureLayer, setSelectedFeaturelayer] =
  //   useState<FeatureLayer>();
  const [sublayerViewFilter, setSublayerViewFilter] = useState<
    SubLayerView | any
  >();
  const [resetButtonClicked, setResetButtonClicked] = useState<boolean>(false);
  const [categoryClicked, setCategoryClicked] = useState<string>("");

  const chartID = "viaduct-bar";

  useEffect(() => {
    if (contractpackages === "S-01") {
      viaductLayer.visible = false;
      buildingLayer.visible = true;

      ChartDataRevit(contractpackages).then((response: any) => {
        setChartData(response[0]);
        setProgress(response);
      });
    } else {
      buildingLayer.visible = false;
      viaductLayer.visible = true;
      generateChartData(contractpackages).then((response: any) => {
        setChartData(response);
      });

      generateTotalProgress(contractpackages).then((response: any) => {
        setProgress(response);
      });
    }

    stationLayer.definitionExpression = "CP = '" + contractpackages + "'";
    zoomToLayer(stationLayer, arcgisScene);

    // const resetChartFilterButton = document.querySelector(
    //   `[id=filterButton]`,
    // ) as HTMLDivElement;
    // // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    // !contractpackages
    //   ? (resetChartFilterButton.hidden = true)
    //   : (resetChartFilterButton.hidden = false);
  }, [contractpackages]);

  // type
  // const types = [
  //   {
  //     category: "Bored Pile",
  //     value: 1,
  //   },
  //   {
  //     category: "Pile Cap",
  //     value: 2,
  //   },
  //   {
  //     category: "Pier",
  //     value: 3,
  //   },
  //   {
  //     category: "Pier Head",
  //     value: 4,
  //   },
  //   {
  //     category: "Precast",
  //     value: 5,
  //   },
  // ];

  // Define parameters
  const marginTop = 0;
  const marginLeft = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const paddingTop = 10;
  const paddingLeft = 5;
  const paddingRight = 5;
  const paddingBottom = 0;

  const xAxisNumberFormat = "#'%'";
  const seriesBulletLabelFontSize = "1vw";

  // axis label
  const yAxisLabelFontSize = "0.8vw";
  const xAxisLabelFontSize = "0.8vw";
  const legendFontSize = "0.8vw";

  // 1.1. Point
  const chartIconWidth = 35;
  const chartIconHeight = 35;
  const chartIconPositionX = -21;
  const chartPaddingRightIconLabel = 45;

  const chartSeriesFillColorComp = "#0070ff";
  const chartSeriesFillColorIncomp = "#000000";
  const chartBorderLineColor = "#00c5ff";
  const chartBorderLineWidth = 0.4;

  // Utility Chart
  useEffect(() => {
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        marginTop: marginTop,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginBottom: marginBottom,
        paddingTop: paddingTop,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
        scale: 1,
        height: am5.percent(100),
      }),
    );
    chartRef.current = chart;

    const yRenderer = am5xy.AxisRendererY.new(root, {
      inversed: true,
    });
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: yRenderer,
        bullet: function (root, _axis, dataItem: any) {
          return am5xy.AxisBullet.new(root, {
            location: 0.5,
            sprite: am5.Picture.new(root, {
              width: chartIconWidth,
              height: chartIconHeight,
              centerY: am5.p50,
              centerX: am5.p50,
              x: chartIconPositionX,
              src: dataItem.dataContext.icon,
            }),
          });
        },
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    yRenderer.labels.template.setAll({
      paddingRight: chartPaddingRightIconLabel,
    });

    yRenderer.grid.template.setAll({
      location: 1,
    });

    // Label properties Y axis
    yAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: yAxisLabelFontSize,
    });
    yAxis.data.setAll(chartData);

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        numberFormat: xAxisNumberFormat,
        calculateTotals: true,
        renderer: am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0,
          strokeWidth: 1,
          stroke: am5.color("#ffffff"),
        }),
      }),
    );

    xAxis.get("renderer").labels.template.setAll({
      //oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: xAxisLabelFontSize,
    });

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        centerY: am5.percent(50),
        x: am5.percent(50),
        marginTop: 20,
        scale: 0.75,
        layout: root.horizontalLayout,
      }),
    );
    legendRef.current = legend;

    legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      fill: am5.color("#ffffff"),
      fontSize: legendFontSize,
      scale: 1.2,
      marginRight: -50,
      //textDecoration: "underline"
      //width: am5.percent(600),
      //fontWeight: '300',
    });

    function makeSeries(name: any, fieldName: any) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          baseAxis: yAxis,
          valueXField: fieldName,
          valueXShow: "valueXTotalPercent",
          categoryYField: "category",
          fill:
            fieldName === "incomp"
              ? am5.color(chartSeriesFillColorIncomp)
              : am5.color(chartSeriesFillColorComp),
          stroke: am5.color(chartBorderLineColor),
        }),
      );

      series.columns.template.setAll({
        fillOpacity: fieldName === "comp" ? 1 : 0.5,
        tooltipText: "{name}: {valueX}", // "{categoryY}: {valueX}",
        tooltipY: am5.percent(90),
        strokeWidth: chartBorderLineWidth,
      });
      series.data.setAll(chartData);

      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text:
              fieldName === "incomp"
                ? ""
                : "{valueXTotalPercent.formatNumber('#.')}%", //"{valueX}",
            fill: root.interfaceColors.get("alternativeText"),
            opacity: fieldName === "incomp" ? 0 : 1,
            fontSize: seriesBulletLabelFontSize,
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });
      });

      const sublayerNames = [
        {
          modelName: "StructuralFoundation",
          category: viatypes[0].category, // pile
        },
        {
          modelName: "StructuralFoundation",
          category: viatypes[1].category, // pile cap
        },
        {
          modelName: "Piers",
          category: viatypes[2].category, // pier
        },
        {
          modelName: "Piers",
          category: viatypes[3].category, // pier head
        },
        {
          modelName: "Decks",
          category: viatypes[4].category, // precast
        },
        {
          modelName: "Piers",
          category: viatypes[6].category, // noise barrier
        },
        // {
        //   modelName: "Piers",
        //   category: viatypes[6].category, // others
        // },
      ];

      // Click event
      series.columns.template.events.on("click", (ev) => {
        const selected: any = ev.target.dataItem?.dataContext;
        const categorySelected: string = selected.category;
        const find = viatypes.find(
          (emp: any) => emp.category === categorySelected,
        );
        setCategoryClicked(categorySelected);
        const typeSelected = find?.value;
        const selectedStatus: number | null =
          fieldName === "comp" ? 4 : fieldName === "ongoing" ? 2 : 1;

        const expression =
          "CP = '" +
          contractpackages +
          "'" +
          " AND " +
          "Type = " +
          typeSelected +
          " AND " +
          "Status = " +
          selectedStatus;

        // For Revit models
        if (contractpackages === "S-01") {
          const expression_revit =
            "CP = '" +
            contractpackages +
            "'" +
            " AND " +
            "Types = " +
            typeSelected +
            " AND " +
            "Status = " +
            selectedStatus;

          // Find sublayer

          const selectedSublayerName = sublayerNames.find(
            (emp: any) => emp.category === categorySelected,
          )?.modelName;

          const sublayersInvisible = () => {
            if (
              categorySelected === viatypes[0].category ||
              categorySelected === viatypes[1].category
            ) {
              stFoundationLayer.definitionExpression = expression_revit;
              stFoundationLayer.visible = true;
              stFramingLayer.visible = false;
              bearingsLayer.visible = false;
              piersLayer.visible = false;
              decksLayer.visible = false;
            } else if (
              categorySelected === viatypes[2].category ||
              categorySelected === viatypes[3].category ||
              categorySelected === viatypes[6].category
            ) {
              piersLayer.definitionExpression = expression_revit;
              piersLayer.visible = true;
              stFramingLayer.visible = false;
              bearingsLayer.visible = false;
              stFoundationLayer.visible = false;
              decksLayer.visible = false;
              specialtyEquipmentLayer.visible = false;
            } else if (categorySelected === viatypes[4].category) {
              decksLayer.definitionExpression = expression_revit;
              decksLayer.visible = true;
              specialtyEquipmentLayer.visible = false;
              bearingsLayer.visible = false;
              stFoundationLayer.visible = false;
              piersLayer.visible = false;
              stFramingLayer.visible = false;
            } else if (categorySelected === "Others") {
              decksLayer.definitionExpression = expression_revit;
              bearingsLayer.definitionExpression = expression_revit;
              piersLayer.definitionExpression = expression_revit;
              stFoundationLayer.definitionExpression = expression_revit;
              decksLayer.visible = true;
              bearingsLayer.visible = true;
              piersLayer.visible = true;
              stFoundationLayer.visible = true;
              stFramingLayer.visible = false; // not part of monitoring
              specialtyEquipmentLayer.visible = false; // not part of monitoring
            }
          };

          arcgisScene?.view
            ?.whenLayerView(buildingLayer)
            .then((buildingSceneLayerView: any) => {
              layerVisibleTrue();
              const sublayerView = buildingSceneLayerView.sublayerViews.find(
                (sublayerView: any) => {
                  return (
                    sublayerView.sublayer.modelName === selectedSublayerName
                  );
                },
              );
              setSublayerViewFilter(sublayerView);
              sublayersInvisible();

              const query = sublayerView.createQuery();
              !sublayerViewFilter
                ? (query.where = "Status >=1")
                : (query.where = expression_revit);
              sublayerViewFilter &&
                sublayerView.queryFeatures(query).then((results: any) => {
                  const lengths = results.features;
                  const rows = lengths.length;
                  const objID = [];
                  for (let i = 0; i < rows; i++) {
                    const obj = results.features[i].attributes.OBJECTID;
                    objID.push(obj);
                  }

                  sublayerView.filter = new FeatureFilter({
                    where: expression_revit,
                  });
                });
            });

          // if (
          //   categorySelected === "Bored Pile" ||
          //   categorySelected === "Pile Cap"
          // ) {
          //   setSelectedFeaturelayer(stFoundationLayer);
          //   stFoundationLayer.definitionExpression = expression_revit;
          //   stFoundationLayer.visible = true;
          //   stFramingLayer.visible = false;
          //   bearingsLayer.visible = false;
          //   piersLayer.visible = false;
          //   decksLayer.visible = false;
          //   specialtyEquipmentLayer.visible = false;
          // } else if (
          //   categorySelected === "Pier" ||
          //   categorySelected === "Pier Head" ||
          //   categorySelected === "Noise Barrier"
          // ) {
          //   setSelectedFeaturelayer(piersLayer);
          //   piersLayer.definitionExpression = expression_revit;
          //   piersLayer.visible = true;
          //   stFramingLayer.visible = false;
          //   bearingsLayer.visible = false;
          //   stFoundationLayer.visible = false;
          //   decksLayer.visible = false;
          //   specialtyEquipmentLayer.visible = false;
          // } else if (categorySelected === "Precast") {
          //   setSelectedFeaturelayer(decksLayer);
          //   decksLayer.definitionExpression = expression_revit;
          //   decksLayer.visible = true;
          //   stFramingLayer.visible = false;
          //   bearingsLayer.visible = false;
          //   piersLayer.visible = false;
          //   stFoundationLayer.visible = false;
          //   specialtyEquipmentLayer.visible = false;
          // } else if (categorySelected === "Others") {
          //   decksLayer.definitionExpression = expression_revit;
          //   bearingsLayer.definitionExpression = expression_revit;
          //   piersLayer.definitionExpression = expression_revit;
          //   stFoundationLayer.definitionExpression = expression_revit;
          //   decksLayer.visible = true;
          //   bearingsLayer.visible = true;
          //   piersLayer.visible = true;
          //   stFoundationLayer.visible = true;
          //   stFramingLayer.visible = false; // not part of monitoring
          //   specialtyEquipmentLayer.visible = false; // not part of monitoring
          // }

          // arcgisScene?.view.on("click", () => {
          //   if (categorySelected === "Others") {
          //     decksLayer.definitionExpression = "1=1";
          //     bearingsLayer.definitionExpression = "1=1";
          //     piersLayer.definitionExpression = "1=1";
          //     stFoundationLayer.definitionExpression = "1=1";
          //   }
          //   if (selectedFeatureLayer) {
          //     selectedFeatureLayer.definitionExpression = "1=1";
          //   }
          //   layerVisibleTrue();
          // });

          // Other contract packages (multipatch layers)
        } else {
          // Define Query
          const query = viaductLayer.createQuery();
          query.where = "1=1";
          arcgisScene?.whenLayerView(viaductLayer).then((layerView: any) => {
            viaductLayer.queryFeatures(query).then((results: any) => {
              const lengths = results.features;
              const rows = lengths.length;
              const objID = [];
              for (let i = 0; i < rows; i++) {
                const obj = results.features[i].attributes.OBJECTID;
                objID.push(obj);
              }
              // if (highlightSelect) {
              //   highlightSelect.remove();
              // }
              // highlightSelect = layerView.highlight(objID);
              arcgisScene?.view.on("click", () => {
                layerView.filter = new FeatureFilter({
                  where: undefined,
                });
                // highlightSelect.remove();
              });
            });
            layerView.filter = new FeatureFilter({
              where: expression,
            });
          });
        }
      });
      legend.data.push(series);
    }
    makeSeries(construction_status[2], "comp");
    makeSeries(construction_status[0], "incomp");
    // makeSeries('Delayed', 'delay');
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  });

  useEffect(() => {
    if (sublayerViewFilter) {
      sublayerViewFilter.filter = new FeatureFilter({
        where: undefined,
      });
      layerVisibleTrue();
    }

    if (categoryClicked === "Others") {
      layerVisibleTrue();
    }
  }, [resetButtonClicked, categoryClicked]);

  const primaryLabelColor = "#9ca3af";
  const valueLabelColor = "#d1d5db";
  return (
    <>
      <CalciteTabs
        slot="panel-end"
        scale="m"
        style={{
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          // borderTopWidth: 5,
          borderColor: "#555555",
        }}
      >
        <div
          id={chartID}
          style={{
            width: "22vw",
            height: "64vh",
            backgroundColor: "rgb(0,0,0,0)",
            color: "white",
            marginRight: "10px",
          }}
        >
          <div
            style={{
              color: primaryLabelColor,
              fontSize: "1.5rem",
              marginLeft: "13px",
              marginTop: "15px",
              marginBottom: "-10px",
            }}
          >
            Total Progress
          </div>
          <CalciteLabel layout="inline">
            <div
              style={{
                color: valueLabelColor,
                fontSize: "2.5rem",
                fontWeight: "bold",
                fontFamily: "calibri",
                lineHeight: "1.2",
                marginLeft: "20px",
                marginBottom: "20px",
              }}
            >
              {progress[2]} %
            </div>
            <img
              src="https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_All_Logo.svg"
              alt="Utility Logo"
              height={"55px"}
              width={"55px"}
              style={{
                marginLeft: "auto",
                marginRight: "15px",
                display: "flex",
                marginTop: "-35px",
              }}
            />
          </CalciteLabel>
          {contractpackages === "S-01" && (
            <div
              id="filterButton"
              style={{
                width: "50%",
                marginLeft: "30%",
                // paddingTop: "10%",
              }}
            >
              <CalciteButton
                iconEnd="reset"
                onClick={() =>
                  setResetButtonClicked(
                    resetButtonClicked === false ? true : false,
                  )
                }
              >
                Reset Chart Filter
              </CalciteButton>
            </div>
          )}
        </div>
      </CalciteTabs>
    </>
  );
};

export default Chart;
