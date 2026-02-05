import { use, useEffect, useState } from "react";
import "../index.css";
import "../App.css";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-placement";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-compass";
import {
  alignmentGroupLayer,
  buildingLayer,
  buildingLayer_s06,
  stationLayer,
  viaductLayer,
} from "../layers";
import { MyContext } from "../contexts/MyContext";

function MapDisplay() {
  const [sceneView, setSceneView] = useState();
  const arcgisScene = document.querySelector("arcgis-scene");
  const { contractpackages } = use(MyContext);

  useEffect(() => {
    if (sceneView) {
      arcgisScene.map.add(buildingLayer);
      // arcgisScene.map.add(buildingLayer_s06);
      arcgisScene.map.add(viaductLayer);
      arcgisScene.map.add(alignmentGroupLayer);
      arcgisScene.map.add(stationLayer);
      arcgisScene.map.ground.navigationConstraint = "none";
      arcgisScene.view.environment.atmosphereEnabled = false;
      arcgisScene.view.environment.starsEnabled = false;
      arcgisScene.view.ui.components = [];

      if (contractpackages === "S-06") {
        arcgisScene.map.add(buildingLayer_s06);
      }
    }
  });

  return (
    <arcgis-scene
      // item-id="5ba14f5a7db34710897da0ce2d46d55f"
      basemap="dark-gray-vector"
      ground="world-elevation"
      viewingMode="local"
      zoom="18"
      center="120.9793, 14.623"
      onarcgisViewReadyChange={(event) => {
        setSceneView(event.target);
      }}
    >
      <arcgis-compass slot="top-right"></arcgis-compass>
      <arcgis-zoom slot="bottom-right"></arcgis-zoom>
    </arcgis-scene>
  );
}

export default MapDisplay;
