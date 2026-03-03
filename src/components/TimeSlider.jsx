import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import {
  stFoundationLayer,
  piersLayer,
  bearingsLayer,
  specialtyEquipmentLayer,
  decksLayer,
  stFramingLayer,
} from "../layers";
import { layersTimeSliderReset } from "../Query";

export default function TimeSlider() {
  const arcgisScene = document.querySelector("arcgis-scene");

  arcgisScene?.viewOnReady(() => {
    const timeSlider = document.querySelector("arcgis-time-slider");
    const start = new Date(2024, 1, 1);
    timeSlider.fullTimeExtent = {
      start: start,
      end: new Date(2026, 2, 15),
    };
    timeSlider.stops = {
      interval: {
        value: 1,
        unit: "months",
      },
      // dates: //
      // count: 50,
    };

    reactiveUtils.watch(
      () => timeSlider?.timeExtent,
      (timeExtent) => {
        if (timeExtent) {
          // console.log(timeExtent.end.getTime());
          const year = timeExtent.end.getFullYear();
          const month = timeExtent.end.getMonth() + 1;
          const day = timeExtent.end.getDate();
          const new_date = `${year}-${month}-${day}`;

          // Filter
          layersTimeSliderReset(stFoundationLayer, "DocUpdate", new_date);
          layersTimeSliderReset(piersLayer, "DocUpdate", new_date);
          layersTimeSliderReset(bearingsLayer, "DocUpdate", new_date);
          layersTimeSliderReset(specialtyEquipmentLayer, "DocUpdate", new_date);
          layersTimeSliderReset(decksLayer, "DocUpdate", new_date);
          layersTimeSliderReset(stFramingLayer, "DocUpdate", new_date);
        }
      },
    );
  });

  return (
    <>
      <div>
        <arcgis-time-slider
          referenceElement="arcgis-scene"
          slot="bottom-right"
          layout="auto"
          mode="time-window"
        ></arcgis-time-slider>
      </div>
    </>
  );
}
