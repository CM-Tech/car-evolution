import chroma from "chroma-js";
import { Vec2 } from "planck-js";
import { MutableRefObject } from "react";
import { CYAN_MUL, PALETTE, YELLOW_MUL } from "./colors";
import { HandlerInfos } from "./simulation";
const dpr = () => window.devicePixelRatio ?? 1;

export type PlanckFixtureUserData = { render?: any };
export const makeRenderHandler = (
  canvas: HTMLCanvasElement,
  { cameraRef, scaleRef, world, terrainXSRef }: HandlerInfos
) => {
  let ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth * dpr();
  canvas.height = window.innerHeight * dpr();
  function circle(shape: planck.Circle, f: planck.Fixture) {
    ctx.lineCap = "round";
    ctx.save();
    let cPath = new Path2D();
    cPath.arc(
      shape.m_p.x * scaleRef.current,
      shape.m_p.y * scaleRef.current,
      shape.m_radius * scaleRef.current,
      0,
      2 * Math.PI
    );

    // ctx.clip(cPath);
    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)";
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = scaleRef.current / 4;
    let orig = ctx.globalCompositeOperation;
    if (true) {
      // ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = PALETTE.BLACK;

      ctx.fillStyle = PALETTE.WHITER; //chroma(PALETTE.WHITER).brighten(1);
      ctx.arc(
        shape.m_p.x * scaleRef.current,
        shape.m_p.y * scaleRef.current,
        shape.m_radius * scaleRef.current,
        0,
        2 * Math.PI
      );
      // ctx.fill();

      ctx.beginPath();
    }
    ctx.arc(
      shape.m_p.x * scaleRef.current,
      shape.m_p.y * scaleRef.current,
      shape.m_radius * scaleRef.current,
      0,
      2 * Math.PI
    );
    // ctx.fillStyle = PALETTE.WHITER;

    // ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = scaleRef.current / 4;
    ctx.moveTo(shape.m_p.x * scaleRef.current, shape.m_p.y * scaleRef.current);
    ctx.lineTo(
      shape.m_p.x * scaleRef.current + shape.m_radius * scaleRef.current,
      shape.m_p.y * scaleRef.current
    );
    ctx.stroke();

    ctx.globalCompositeOperation = "orig";
    ctx.restore();
  }

  function polygon(
    shape: planck.Polygon,
    f: planck.Fixture,
    isground: boolean
  ) {
    const { render } = (f.getUserData() ?? {}) as PlanckFixtureUserData;
    ctx.save();
    let polygonPath = new Path2D();
    polygonPath.moveTo(
      shape.m_vertices[0].x * scaleRef.current,
      shape.m_vertices[0].y * scaleRef.current
    );
    for (let i = 1; i < shape.m_vertices.length; i++) {
      polygonPath.lineTo(
        shape.m_vertices[i].x * scaleRef.current,
        shape.m_vertices[i].y * scaleRef.current
      );
    }
    // if (!isground) ctx.clip(cPath);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    let orig = ctx.globalCompositeOperation;
    if (isground) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#8B9B56";

      ctx.fillStyle = chroma("#8B9B56").brighten(1).hex();
      ctx.moveTo(
        shape.m_vertices[1].x * scaleRef.current,
        shape.m_vertices[1].y * scaleRef.current
      );
      ctx.lineTo(
        shape.m_vertices[2].x * scaleRef.current,
        shape.m_vertices[2].y * scaleRef.current
      );

      let a = ctx
        .getTransform()
        .transformPoint(
          new DOMPoint(
            shape.m_vertices[1].x * scaleRef.current,
            shape.m_vertices[1].y * scaleRef.current
          )
        );
      let b = ctx
        .getTransform()
        .transformPoint(
          new DOMPoint(
            shape.m_vertices[2].x * scaleRef.current,
            shape.m_vertices[2].y * scaleRef.current
          )
        );
      let c = ctx
        .getTransform()
        .inverse()
        .transformPoint(new DOMPoint(b.x, canvas.height));
      ctx.lineTo(c.x, c.y);
      let d = ctx
        .getTransform()
        .inverse()
        .transformPoint(new DOMPoint(a.x, canvas.height));
      ctx.lineTo(d.x, d.y);

      ctx.save();
      ctx.clip();
      ctx.moveTo(
        shape.m_vertices[1].x * scaleRef.current,
        shape.m_vertices[1].y * scaleRef.current
      );
      ctx.lineTo(
        shape.m_vertices[2].x * scaleRef.current,
        shape.m_vertices[2].y * scaleRef.current
      );

      ctx.lineTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
      // ctx.moveTo(shape.m_vertices[0].x * scaleRef.current, shape.m_vertices[0].y * scaleRef.current);
      // for (let i = 1; i < shape.m_vertices.length; i++) {
      // 	ctx.lineTo(shape.m_vertices[i].x * scaleRef.current, shape.m_vertices[i].y * scaleRef.current);
      // }
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth = scaleRef.current / 2;
      ctx.moveTo(
        shape.m_vertices[1].x * scaleRef.current,
        shape.m_vertices[1].y * scaleRef.current
      );
      ctx.lineTo(
        shape.m_vertices[2].x * scaleRef.current,
        shape.m_vertices[2].y * scaleRef.current
      );
      // ctx.moveTo(shape.m_vertices[2].x * scaleRef.current, shape.m_vertices[2].y * scaleRef.current);
      // ctx.lineTo(shape.m_vertices[3].x * scaleRef.current, shape.m_vertices[3].y * scaleRef.current);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.moveTo(
        shape.m_vertices[0].x * scaleRef.current,
        shape.m_vertices[0].y * scaleRef.current
      );
      for (let i = 1; i < shape.m_vertices.length; i++) {
        ctx.lineTo(
          shape.m_vertices[i].x * scaleRef.current,
          shape.m_vertices[i].y * scaleRef.current
        );
      }
    }
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)";
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.fillStyle = chroma(render?.stroke ?? ctx.strokeStyle)
      .brighten(2)
      .hex();

    // ctx.fillStyle = PALETTE.WHITER;
    let m = ctx.strokeStyle + "";
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 8;
    ctx.closePath();
    if (!isground) {
      // ctx.restore();
      // ctx.save();
      // ctx.globalCompositeOperation = "source-over";
      ctx.fill();
      ctx.globalCompositeOperation = "multiply";
      ctx.lineWidth = 0.0001;
      ctx.stroke();

      ctx.strokeStyle = m;
      if (shape.m_vertices.length === 3 && false) {
        ctx.beginPath();
        let f = true;
        for (let i = 0; i < 3; i++) {
          if (Math.hypot(shape.m_vertices[i].x, shape.m_vertices[i].y) > 0.01) {
            if (f)
              ctx.moveTo(
                shape.m_vertices[i].x * scaleRef.current,
                shape.m_vertices[i].y * scaleRef.current
              );
            ctx.lineTo(
              shape.m_vertices[i].x * scaleRef.current,
              shape.m_vertices[i].y * scaleRef.current
            );
            f = false;
          }
        }
        ctx.stroke();
      } else {
        ctx.stroke();
      }
      ctx.lineWidth = scaleRef.current / 4;
      // ctx.clip(polygonPath);
      if (shape.m_vertices.length === 3 && false) {
        ctx.beginPath();
        let f = true;
        for (let i = 0; i < 3; i++) {
          if (Math.hypot(shape.m_vertices[i].x, shape.m_vertices[i].y) > 0.01) {
            if (f)
              ctx.moveTo(
                shape.m_vertices[i].x * scaleRef.current,
                shape.m_vertices[i].y * scaleRef.current
              );
            ctx.lineTo(
              shape.m_vertices[i].x * scaleRef.current,
              shape.m_vertices[i].y * scaleRef.current
            );
            f = false;
          }
        }
        ctx.stroke();
      } else {
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = orig;
    ctx.restore();
  }

  return () => {
    let nW = Math.ceil(window.innerWidth * dpr());
    let nH = Math.ceil(window.innerHeight * dpr());
    if (canvas.width !== nW || canvas.height !== nH) {
      canvas.width = nW;
      canvas.height = nH;
    }
    scaleRef.current = Math.min(canvas.width / 40, canvas.height / 40);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = PALETTE.WHITE;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(
      -cameraRef.current.x * scaleRef.current,
      -cameraRef.current.y * scaleRef.current
    );
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "multiply";
    // ctx.fillStyle = ctx.createPattern(paperTex, "repeat");
    // ctx.fillRect(camera.x * scaleRef.current, camera.y * scaleRef.current, c.width, c.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    ctx.translate(
      cameraRef.current.x * scaleRef.current,
      cameraRef.current.y * scaleRef.current
    );
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);
    ctx.translate(
      -cameraRef.current.x * scaleRef.current,
      cameraRef.current.y * scaleRef.current
    );
    let renderLayers: {
      index: number;
      pairs: [{ f: planck.Fixture; b: planck.Body }];
    }[] = [];
    function addToLayer(layer: number, f: planck.Fixture, b: planck.Body) {
      let found = false;
      for (let i = 0; i < renderLayers.length; i++) {
        if (renderLayers[i].index == layer) {
          found = true;
          renderLayers[i].pairs.push({ f: f, b: b });
        }
      }
      if (!found) {
        renderLayers.push({ index: layer, pairs: [{ f: f, b: b }] });
      }
    }
    for (let body = world.getBodyList(); body; body = body.getNext()) {
      for (let f = body.getFixtureList(); f; f = f.getNext()) {
        let layer = 0;
        const { render } = (f.getUserData() ?? {}) as PlanckFixtureUserData;
        if (render?.layer) {
          layer = render?.layer;
        }
        addToLayer(layer, f, body);
      }
    }
    renderLayers.sort(function (a, b) {
      return a.index - b.index;
    });
    let terrainPoses = terrainXSRef.current;
    if (terrainPoses.length >= 2) {
      ctx.beginPath();
      let a = ctx
        .getTransform()
        .transformPoint(
          new DOMPoint(
            terrainPoses[0].x * scaleRef.current,
            terrainPoses[0].y * scaleRef.current
          )
        );
      let b = ctx
        .getTransform()
        .transformPoint(
          new DOMPoint(
            terrainPoses[terrainPoses.length - 1].x * scaleRef.current,
            terrainPoses[terrainPoses.length - 1].y * scaleRef.current
          )
        );
      let c = ctx
        .getTransform()
        .inverse()
        .transformPoint(new DOMPoint(b.x, canvas.height));
      let d = ctx
        .getTransform()
        .inverse()
        .transformPoint(new DOMPoint(a.x, canvas.height));

      ctx.moveTo(d.x, d.y);
      for (let i = 0; i < terrainPoses.length; i++) {
        let p = terrainPoses[i];
        if (i === 0) {
          ctx.lineTo(p.x * scaleRef.current, p.y * scaleRef.current);
        } else {
          ctx.lineTo(p.x * scaleRef.current, p.y * scaleRef.current);
        }
      }

      ctx.lineTo(c.x, c.y);
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = chroma
        .blend(
          CYAN_MUL,
          chroma.blend(YELLOW_MUL, PALETTE.WHITE, "multiply").hex(),
          "multiply"
        )
        .hex();

      ctx.fillStyle = chroma(
        chroma
          .blend(
            CYAN_MUL,
            chroma.blend(YELLOW_MUL, PALETTE.WHITE, "multiply").hex(),
            "multiply"
          )
          .hex()
      )
        .brighten(1)
        .hex();

      ctx.lineWidth = scaleRef.current * (0.5 - 0.5 * 0.5);
      ctx.fill();
      ctx.stroke();
    }

    //
    for (let i = 0; i < renderLayers.length; i++) {
      for (let j = 0; j < renderLayers[i].pairs.length; j++) {
        let f = renderLayers[i].pairs[j].f;
        let body = renderLayers[i].pairs[j].b;

        const { render } = (f.getUserData() ?? {}) as PlanckFixtureUserData;
        ctx.strokeStyle = render?.stroke ?? "#000000";
        ctx.fillStyle = render?.fill ?? "rgba(0,0,0,0)";
        ctx.lineWidth = 1;
        ctx.save();

        ctx.globalCompositeOperation = "multiply";
        ctx.translate(
          f.m_body.m_xf.p.x * scaleRef.current,
          f.m_body.m_xf.p.y * scaleRef.current
        );
        ctx.rotate(Math.atan2(f.m_body.m_xf.q.s, f.m_body.m_xf.q.c));
        if (f.m_shape.getType() == "polygon") {
          let isg = render?.special === "ground";
          if (!isg) polygon(f.m_shape as planck.Polygon, f, isg);
        }
        if (f.m_shape.getType() == "circle")
          circle(f.m_shape as planck.Circle, f);

        ctx.restore();

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
      }
    }
  };
};
