import type { Route } from "./+types/home";
import React, { useState, useEffect, use } from "react";
import {
  StaticCanvas,
  util,
  Canvas,
  Path,
  loadSVGFromString,
  FabricObject,
  version,
} from "fabric";
import opentype from "opentype.js";
import { TextToSVG, fonts, ricons } from "./generator";
import path from "path";
import Module from "public/printthing.mjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faT, faImage } from "@fortawesome/free-solid-svg-icons";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Print a thing" },
    { name: "description", content: "You can make stuff here" },
  ];
}
import { createClient } from "@supabase/supabase-js";
import { useLocation } from "react-router";


// dont worry, this key is meant to be published
export const supabase = createClient(
  "https://btpljlgfajycbpehdich.supabase.co",
  "sb_publishable_kqXuLVoP7gyP1OFrBy0vJw_306sXkfF",
);

const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 980">
  <circle cx="490" cy="490" r="440" fill="none" stroke="#000" stroke-width="100"/>
  <path d="M219,428H350a150,150 0 1 1 0,125H219a275,275 0 1 0 0-125z"/>
</svg>
`;

enum ObjectType {
  Svg = 1,
  Text = 2,
}
declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    otype?: ObjectType;
    font?: number;
    data?: string;
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    otype?: ObjectType;
    font?: number;
    data?: string;
  }
}
FabricObject.customProperties = ["otype", "font"];
function fromBase64Url(str: string) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}
export default function Home() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);
  const obj = fonts[33];
  console.log(obj);
  const [canvas, setCanvas] = useState<Canvas>();
  const [svg, setsvg] = useState<String | null>(null);
  const [typing, settyping] = useState<String>("");
  const [search, setsearch] = useState<String>("");
  const [icons, seticons] = useState<string[]>([]);
  const [sent, setsent] = useState(false);
  const updateText = (obj: FabricObject, text: string) => {
    obj.set({ path: new Path(TextToSVG(text)).path });
    obj.data = text;
    settyping(text);
    canvas?.requestRenderAll();
  };
  const updateIcon = (obj: FabricObject, key: string) => {
    fetch("/icons/" + key + ".svg")
      .then((res) => res.text())
      .then((text) =>
        loadSVGFromString(text).then((result) => {
          const objects = result.objects.filter(
            (o): o is FabricObject => o !== null,
          );

          const SVG = util.groupSVGElements(objects, result.options);
          console.log(version);
          console.log(SVG.get("path"));
          const center = obj.getCenterPoint();

          SVG.set({ originX: "center", originY: "center" });

          SVG.scaleToWidth(obj.getScaledWidth());
          SVG.scaleToHeight(obj.getScaledHeight());

          SVG.set({
            left: center.x,
            top: center.y,
            angle: obj.angle,
          });
          SVG.otype = ObjectType.Svg;
          SVG.font = 0;
          canvas?.remove(obj);
          canvas?.add(SVG);
          canvas?.setActiveObject(SVG);
          canvas?.requestRenderAll();
        }),
      );
  };

  const createText = () => {
    const path = new Path(TextToSVG("entertexthere"), {
      left: 50,
      top: 50,
      fill: "",
      stroke: "black",
      strokeWidth: 0.2,
      otype: ObjectType.Text,
      font: 0,
      data: "entertexthere",
    });
    canvas?.add(path);
    canvas?.setActiveObject(path)
  };
  const createIcons = () => {
    loadSVGFromString(svgString).then((result) => {
      const objects = result.objects.filter(
        (o): o is FabricObject => o !== null,
      );

      const SVG = util.groupSVGElements(objects, result.options);
      SVG.otype = ObjectType.Svg;
      SVG.font = 0;

      SVG.set({ left: 40, top: 5, scaleX: 0.1, scaleY: 0.1 });
      canvas?.add(SVG);
      canvas?.setActiveObject(SVG)
      canvas?.requestRenderAll();
    });
  };
  useEffect(() => {
    if (svg) {
      const canvas = canvasRef.current!;
      Module({
        canvas,
        locateFile: (p: string) => `/${p}`,
        print: (t: string) => {},
        printErr: (t: string) => console.error(t),
      }).then((mod) => {
        if (mod) {
          mod.ccall(
            "flatten",
            null,
            ["string", "number", "number", "number"],
            [svg, 100, 100, 0.1],
          );
          console.log("test");
          console.log(mod.FS.readdir("/"));
          console.log(mod.FS.readFile("/out.gcode", { encoding: "utf8" }));
        }
      });
    }
  }, [svg]);

  useEffect(() => {
    if (activeObject?.data) {
      settyping(activeObject?.data);
    }
  }, [activeObject]);
  const location = useLocation();
  useEffect(() => {
    var c = new Canvas("danda", {
      height: 400,
      width: 400,
    });
    console.log(createSvg());
    const params = new URLSearchParams(location.search);
    const b64 = params.get("svgB64");
    console.log(b64)
    const svgText = b64 ? fromBase64Url(b64) : "";
    console.log(svgText)
    loadSVGFromString(svgText).then((result) => {
      const objects = result.objects.filter(
        (o): o is FabricObject => o !== null,
      );

      const SVG = util.groupSVGElements(objects, result.options);
      c?.add(SVG);
      c?.requestRenderAll();
    });
    const handleSelection = (selected: FabricObject | null) => {
      setActiveObject(selected);
    };
    c.on("selection:created", (opt) => {
      const first = opt.selected?.[0] ?? null;
      setActiveObject(first);
    });
    c.on("selection:updated", (opt) => {
      const first = opt.selected?.[0] ?? null;
      setActiveObject(first);
    });
    c.on("selection:cleared", () => setActiveObject(null));

    console.log(c.toSVG({ width: "100", height: "100" }));
    setCanvas(c);
  }, []);
  useEffect(() => {}, [search]);
  const createSvg = () => {
    var d = "";
    for (let i = 0; i < obj.cords.length; i += 2) {
      if (obj.cords[i] == -69) {
        i += 2;
        if (i + 2 < obj.cords.length) {
          d += "M " + obj.cords[i] + " " + obj.cords[i + 1] + " ";
        }
      } else if (i == 0) {
        d += "M " + obj.cords[i] + " " + obj.cords[i + 1] + " ";
      } else {
        d += "L " + obj.cords[i] + " " + obj.cords[i + 1] + " ";
      }
    }
    return d;
  };

  return (
    <div className="flex items-center content-center justify-center">
      <div className="border text-center pb-2 h-[200px] w-[200px] ">
        {activeObject ? "" : "No object selected"}
        {activeObject?.otype == ObjectType.Svg ? (
          <div>
            <h1 className="text-center text-xl font-bold">Icon</h1>
            <input
              className="border rounded py-0.5  mb-1"
              placeholder="leave empty for all"
              value={search.toString()}
              onKeyDownCapture={(e) => e.stopPropagation()}
              onKeyPressCapture={(e) => e.stopPropagation()}
              onKeyUpCapture={(e) => e.stopPropagation()}
              onChange={(e) => setsearch(e.target.value)}
            ></input>
            <button
              className="border px-2 hover:text-gray-500 hover:cursor-pointer"
              onClick={() => {
                seticons(
                  Object.keys(ricons).filter((key) => {
                    return (
                      ricons[key]?.some((tag) =>
                        tag
                          .toString()
                          .toLowerCase()
                          .includes(search.toString().toLowerCase()),
                      ) || key.includes(search.toString().toLowerCase())
                    );
                  }),
                );
              }}
            >
              Search
            </button>
            <div className="flex space-x-2 mt-5 p-2 overflow-scroll h-[60px] border">
              {icons.map((key) => {
                return (
                  <img
                    loading="lazy"
                    decoding="async"
                    onClick={() => updateIcon(activeObject, key)}
                    className="hover:border"
                    src={`/icons/${key}.svg`}
                    alt="home"
                    width={400}
                  />
                );
              })}
            </div>
            <span>{`${icons.length} icons found`}</span>
          </div>
        ) : (
          ""
        )}
        {activeObject?.otype == ObjectType.Text ? (
          <div>
            <h1 className="text-center text-xl font-bold">Text</h1>
            <input
              className="border rounded py-0.5  mb-1"
              value={typing.toString()}
              placeholder="Input text here"
              onKeyDownCapture={(e) => e.stopPropagation()}
              onKeyPressCapture={(e) => e.stopPropagation()}
              onKeyUpCapture={(e) => e.stopPropagation()}
              onChange={(e) => updateText(activeObject, e.target.value)}
            ></input>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="flex h-screen flex-col items-center content-center justify-center">
        <div className="flex w-[200px] content-center justify-around">
          <button
            onClick={createText}
            className="hover:text-gray-500 hover:cursor-pointer w-8 h-8 border"
          >
            <FontAwesomeIcon icon={faT} />
          </button>
          <button
            onClick={createIcons}
            className="hover:text-gray-500 hover:cursor-pointer w-8 h-8 border"
          >
            <FontAwesomeIcon icon={faImage} />
          </button>
        </div>
        <div className="flex rounded-6 border-b border-dashed m-6">
          <div className="text-center">
            canvas
            <canvas
              className={`${svg ? "" : "border-r"} w-full border-t border-l border-dashed`}
              id="danda"
            />
          </div>
          <div className={` ${svg ? "" : "hidden"} text-center`}>
            preview
            <canvas
              ref={canvasRef}
              className={` ${svg ? "" : "hidden"} border-t border-r border-dashed`}
              width={400}
              height={400}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="border hover:text-gray-500 hover:cursor-pointer w-36"
            onClick={() => {
              const str = canvas?.toSVG({ width: "100", height: "100" });
              console.log(str);
              setsvg(str ? str : null);
            }}
          >
            Preview image
          </button>
          <button
            className="border hover:text-gray-500 hover:cursor-pointer w-36"
            onClick={async () => {
              if (!sent) {
                const ss = canvas?.toSVG();
                const len = ss?.length;
                console.log(len);

                if (len && len > 800) {
                  const { data, error } = await supabase.from("svgs").insert({
                    svg: ss,
                  });

                  console.log("data:", data);
                  console.log("error:", error);
                }
                setsent(true);
              }
            }}
          >
            {sent ? "Sent!" : "Send to me!"}
          </button>
        </div>
      </div>
    </div>
  );
}
