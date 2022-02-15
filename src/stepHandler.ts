import {
  Box,
  Circle,
  Fixture,
  FixtureOpt,
  Polygon,
  PrismaticJoint,
  RevoluteJoint,
  Shape,
  Vec2,
} from "planck-js";
import { Car, decodeRGB } from "../car";
import { convertToMaterial } from "../material-color";
import { COLOR_MUL, PALETTE } from "./colors";
import { HandlerInfos } from "./simulation";
import { terrainSisyphus, terrainHills, TerrainPreset, terrainRocky,terrainCrescendo } from "./terrain";

export const BODY_CATEGORY = 0b0000000000000010;
export const WHEEL_CATEGORY = 0b0000000000000100;

export const BODY_MASK = 0b1111111111111111;
export const BODY_BROKE_MASK =
  0b1111111111111111 ^ BODY_CATEGORY ^ WHEEL_CATEGORY;
export const WHEEL_MASK = 0b1111111111111111 ^ WHEEL_CATEGORY ^ BODY_CATEGORY;

export const wheelShapeDef: FixtureOpt = {};
wheelShapeDef.filterCategoryBits = WHEEL_CATEGORY;
wheelShapeDef.filterMaskBits = WHEEL_MASK;
wheelShapeDef.density = 0.5;
wheelShapeDef.friction = 10;
wheelShapeDef.restitution = 0.1;

export const bodyShapeDef: FixtureOpt = {};
bodyShapeDef.filterCategoryBits = BODY_CATEGORY;
bodyShapeDef.filterMaskBits = BODY_MASK;
bodyShapeDef.density = 2;
bodyShapeDef.friction = 10.0;
bodyShapeDef.restitution = 0.05;

export const negBodyShapeDef: FixtureOpt = {
  ...bodyShapeDef,
  density: -bodyShapeDef.density,
};
export const springShapeDef: FixtureOpt = {};
springShapeDef.filterCategoryBits = WHEEL_CATEGORY;
springShapeDef.filterMaskBits = WHEEL_MASK;
springShapeDef.density = 15;
springShapeDef.friction = 10.0;
springShapeDef.restitution = 0.05;

export const bodyBrokeShapeDef: FixtureOpt = {};
bodyBrokeShapeDef.filterMaskBits = BODY_BROKE_MASK;
bodyBrokeShapeDef.density = 2;
bodyBrokeShapeDef.restitution = 0.05;
export const groundFD: FixtureOpt = {
  density: 0.0,
  friction: 2.0,
};
export const D_GRAVITY = 10;
export const MASS_MULT = 1.5;

var HZ = 4.0;
var ZETA = 0.7;
var SPEED = 6 * Math.PI;
export const makeStepHandler = (
  canvas: HTMLCanvasElement,
  {
    terrainXSRef,
    cameraRef,
    world,
    ground,
    carScoreRef,
    restartCurrentRef,
    distTicksRef,
    currentTicksRef,
    boxCarRef,
    scaleRef,
    genXRef,
    terrain,
    setLeaderboard,
    setScore,
    restartTicksRef,
    handleImportCarRef,
    GRAVITY,
  }: HandlerInfos
) => {
  let simSpeed = 1;
  function updateProgress(x: number) {
    if (carScoreRef.current < x - 3) {
      restartCurrentRef.current = 0;
      carScoreRef.current = x + 0;
      boxCarRef.current.score = x + 0;
      distTicksRef.current = currentTicksRef.current + 0;
    }
  }
  var terrains = [];
  terrainXSRef.current = [];
  function resetGround() {
    terrains
      .filter(function (t) {
        return (
          t.m_body.m_xf.p.x + t.m_shape.m_centroid.x <
          cameraRef.current.x -
            Math.max(canvas.width / scaleRef.current / 2, 100)
        );
      })
      .forEach(function (a) {
        let idx = terrains.indexOf(a);
        terrains.splice(idx, 1);

        terrainXSRef.current.splice(idx, 1);
        ground.destroyFixture(a);
      });
  }
  function destroyGround() {
    while (ground.m_fixtureList) {
      ground.destroyFixture(ground.m_fixtureList);
    }
    terrainXSRef.current = [];
    terrains = [];
  }

  function genGround() {
    //resetGround()
    while (
      genXRef.current <
      cameraRef.current.x + Math.max(canvas.width / scaleRef.current / 2, 100)
    ) {
      var thickness = 0.5;
      var curX = genXRef.current;
      var nextX =
        genXRef.current +
        (terrain === TerrainPreset.Hills || terrain === TerrainPreset.Sisyphus
          ? 2
          : 7); //2 for terrain 3 (Sisyphus) or 4 (hills) otherwise 7
      genXRef.current = nextX;
      var terrainFunc =
        terrain === TerrainPreset.Hills ? terrainHills : (terrain === TerrainPreset.Sisyphus ? terrainSisyphus: (terrain === TerrainPreset.Crescendo ? terrainCrescendo: terrainRocky));
      var curPos = Vec2(curX, terrainFunc(curX));
      var nextPos = Vec2(nextX, terrainFunc(nextX));

      var angle = Math.atan2(nextPos.y - curPos.y, nextPos.x - curPos.x);
      let va = Vec2(nextPos.y - curPos.y, curPos.x - nextPos.x);
      va.normalize();
      var shape = Box(
        Math.sqrt(
          Math.pow(nextPos.x - curPos.x, 2) + Math.pow(nextPos.y - curPos.y, 2)
        ) / 2,
        thickness,
        Vec2(curPos.x / 2 + nextPos.x / 2, curPos.y / 2 + nextPos.y / 2).add(
          va.mul(thickness / 2)
        ),
        angle
      );
      var t_fix = ground.createFixture(shape, groundFD);
      terrains.push(t_fix);
      terrainXSRef.current.push(nextPos);
      t_fix.render = {
        special: "ground",
        fill: PALETTE.BLACK,
        stroke: PALETTE.BLACK,
        layer: 0,
      };
      // genX = nextX;
    }
  }
  genGround();
  var topScores = [];
  var prevGen = [];
  var curGen = [];
  var maxTops = 6;
  var genSize = 16;
  var carDNA = new Car();
  function genCarFromOldParents() {
    var parentPool = [];
    for (var i = 0; i < topScores.length; i++) {
      parentPool.push(topScores[topScores.length - i - 1].car);
    }
    for (var i = 0; i < prevGen.length; i++) {
      parentPool.push(prevGen[prevGen.length - i - 1].car);
    }
    for (var i = 0; i < curGen.length; i++) {
      parentPool.push(curGen[curGen.length - i - 1].car);
    }
    var pPow = 2;
    return parentPool[
      Math.floor(Math.pow(Math.random(), pPow) * parentPool.length)
    ].breed(
      parentPool[Math.floor(Math.pow(Math.random(), pPow) * parentPool.length)]
    );
  }

  function exportBestCar() {
    if (topScores.length < 1) {
      return "";
    }
    topScores.sort(function (a, b) {
      return a.score - b.score;
    });
    return topScores[topScores.length - 1].car.exportCar();
  }

  function worstScore() {
    if (topScores.length < 1) {
      return 0;
    }
    var s = topScores[0].score;
    for (var i = 0; i < topScores.length; i++) {
      s = Math.min(s, topScores[i].score);
    }
    return s;
  }
  function insertNewCarScore(car, score, ticks) {
    topScores.push({ score: score, ticks: ticks, car: car });
    topScores.sort(function (a, b) {
      return a.score - b.score;
    });
    if (topScores.length > maxTops) {
      topScores.splice(0, topScores.length - maxTops);
    }
  }
  function updateScoreTable() {
    topScores.sort(function (a, b) {
      return b.score - a.score;
    });
    setLeaderboard(topScores);
    if (topScores.length > 0) {
      document
        .querySelectorAll("#score-best")[0]
        .setAttribute("value", topScores[0].car.exportCar());
    }
  }
  function switchCar(first) {
    carScoreRef.current = Math.max(
      boxCarRef.current.getPosition().x,
      carScoreRef.current
    );
    var score = carScoreRef.current + 0;
    var ticks = distTicksRef.current + 0;
    if (first) {
      topScores = [];
      prevGen = [];
      curGen = [];
      carDNA = new Car();
      createCar(carDNA);
    } else {
      if (score > 0) {
        curGen.push({
          score: score,
          ticks: distTicksRef.current,
          car: carDNA.clone(),
        });
        insertNewCarScore(carDNA.clone(), score, ticks);
      }
      if (curGen.length >= genSize) {
        curGen.sort(function (a, b) {
          return a.score - b.score;
        });
        curGen.splice(0, curGen.length - 4);
        prevGen = curGen;
        curGen = [];
      }
      if (prevGen.length === 0) {
        if (topScores.length > 0) {
          carDNA = genCarFromOldParents();
        } else {
          carDNA = new Car();
        }
        createCar(carDNA);
      } else {
        carDNA = genCarFromOldParents();
        createCar(carDNA);
      }
    }
    updateScoreTable();
  }
  function importCar(str:string) {
    var score = carScoreRef.current + 0;

    topScores = [];
    prevGen = [];
    curGen = [];
    carDNA = new Car().importCar(str);
    createCar(carDNA);
  }
  handleImportCarRef.current = importCar;

  // Breakable dynamic body
  var m_velocity;
  var m_angularVelocity;
  var carCreationPoint = Vec2(0.0, 10.0);
  boxCarRef.current = world.createDynamicBody({
    position: carCreationPoint.clone(),
  });
  var wheelFD = wheelShapeDef;
  wheelFD.friction = 1;
  var autoFast = false;
  var partsToBreak:Fixture[] = [];
  var connectedParts: Fixture[] = [];
  var connectedPartsI = [];
  var connectedPartsArea = [];
  var connectedPartsOld: Fixture[] = [];
  var connectedShapes: Shape[] = [];
  var wheels = [];
  var wheelsF = [];
  var wheelJoints = [];
  var springs = [];
  var springsF = [];
  var springJoints = [];
  var connectedPartsWheels: Fixture[][] = [];
  var connectedPartsSprings: Fixture[][] = [];
  var connectedSpringsOld: Fixture[][] = [];
  var connectedWheelsOld: Fixture[][] = [];
  var center_vec = carCreationPoint.clone();

  //create car from data
  function removeOldCar() {
    for (var i = 0; i < connectedParts.length; i++) {
      world.destroyBody(connectedParts[i].m_body);
    }
    for (var i = 0; i < connectedPartsOld.length; i++) {
      world.destroyBody(connectedPartsOld[i].m_body);
    }
    for (var i = 0; i < wheels.length; i++) {
      if (wheels[i]) {
        world.destroyBody(wheels[i]);
      }
    }
    for (var i = 0; i < connectedWheelsOld.length; i++) {
      if (connectedWheelsOld[i]) {
        world.destroyBody(connectedWheelsOld[i]);
      }
    }
    for (var i = 0; i < springs.length; i++) {
      if (springs[i]) {
        world.destroyBody(springs[i]);
      }
    }
    for (var i = 0; i < connectedSpringsOld.length; i++) {
      if (connectedSpringsOld[i]) {
        world.destroyBody(connectedSpringsOld[i]);
      }
    }
    world.destroyBody(boxCarRef.current);
    boxCarRef.current = world.createBody({
      position: carCreationPoint.clone(),
    });
    partsToBreak = [];
    connectedParts = [];
    connectedPartsI = [];
    connectedPartsArea = [];
    connectedPartsOld = [];
    connectedShapes = [];
    wheels = [];
    wheelsF = [];
    wheelJoints = [];
    connectedPartsWheels = [];
    connectedWheelsOld = [];
    springs = [];
    springJoints = [];
    connectedPartsSprings = [];
    connectedSpringsOld = [];
    center_vec = carCreationPoint.clone();
  }

  var carScale = 1;
  let cols = COLOR_MUL;
  function createCar(carData: Car) {
    restartCurrentRef.current = 0;
    carDNA = carData;
    removeOldCar();
    boxCarRef.current = world.createDynamicBody({
      position: carCreationPoint.clone(),
    });
    connectedParts = [];
    connectedPartsI = [];
    connectedPartsArea = [];
    connectedPartsOld = [];
    connectedShapes = [];
    wheels = [];
    wheelsF = [];
    wheelJoints = [];
    connectedPartsWheels = [];
    connectedWheelsOld = [];
    springs = [];
    springJoints = [];
    connectedPartsSprings = [];
    connectedSpringsOld = [];
    center_vec = carCreationPoint.clone();
    var lowestY = carCreationPoint.y + 0;
    var p_angle = Math.abs(
      ((carData.data.angleWeights[0] / carData.totalAngleWeights()) *
        Math.PI *
        2) %
        (Math.PI * 2)
    );
    if (((p_angle + Math.PI) % (Math.PI * 2)) - Math.PI < 0) {
      p_angle = Math.PI - 1 - (((p_angle + Math.PI) % (Math.PI * 2)) - Math.PI);
    }
    for (var i = 0; i < carData.bodyParts; i++) {
      connectedPartsArea.push(carData.getAreaOfPiece(i));
      var new_p_angle =
        p_angle +
        (carData.data.angleWeights[(i + 1) % carData.data.angleWeights.length] /
          carData.totalAngleWeights()) *
          Math.PI *
          2;
      var m_shape = Polygon([
        Vec2(0, 0),
        Vec2(
          Math.cos(p_angle + 0) * carData.data.lengths[i] * carScale,
          Math.sin(p_angle + 0) * carData.data.lengths[i] * carScale
        ),
        Vec2(
          Math.cos(new_p_angle + 0) *
            carData.data.lengths[(i + 1) % carData.data.lengths.length] *
            carScale,
          Math.sin(new_p_angle + 0) *
            carData.data.lengths[(i + 1) % carData.data.lengths.length] *
            carScale
        ),
      ]);
      var bDef = bodyShapeDef;
      if (
        (((((new_p_angle - p_angle + 0) / Math.PI) * 180 + 360) % 360) + 360) %
          360 >
        180
      ) {
        bDef = negBodyShapeDef;
        console.log("neg");
      }
      var m_piece = boxCarRef.current.createFixture(m_shape, bDef);
      lowestY = Math.min(lowestY, m_piece.getAABB(0).lowerBound.y);
      //var bodyColor = decodeRGB(carData.data.colors[i]||0);
      //console.log("#"+(carData.data.colors[i]||0).toString(16).padStart(6,"0"));
      var bodyColor = decodeRGB(
        parseInt(
          convertToMaterial(
            (carData.data.colors[i] || 0).toString(16).padStart(6, "0")
          ).substring(1),
          16
        )
      );
      var colorLerp = 0;
      /*m_piece.render = {
      fill : "rgba(" + bodyColor.r * (1 - colorLerp) + 255 * colorLerp + "," + bodyColor.g * (1 - colorLerp) + 255 * colorLerp + "," + bodyColor.b * (1 - colorLerp) + 255 * colorLerp + ",1)", //"hsla(" + Math.random() * 360 + ",100%,50%,0.5)"
      stroke : "rgba(" + bodyColor.r * (1 - colorLerp) + 255 * colorLerp + "," + bodyColor.g * (1 - colorLerp) + 255 * colorLerp + "," + bodyColor.b * (1 - colorLerp) + 255 * colorLerp + ",1)"//"rgba(255,255,255,1)" //stroke : "rgba(" + bodyColor.r * (1 - colorLerp) + 255 * colorLerp + "," + bodyColor.g * (1 - colorLerp) + 255 * colorLerp + "," + bodyColor.b * (1 - colorLerp) + 255 * colorLerp + ",0.75)"
          };*/
      let m = carData.data.colors[i] || 0;
      var matHex = cols[m % cols.length]; //
      // matHex = convertToMaterial(
      //   (carData.data.colors[i] || 0).toString(16).padStart(6, "0")
      // );
      m_piece.render = {
        fill: matHex,
        stroke: matHex,
        layer: 6,
      };
      connectedParts.push(m_piece);
      connectedPartsI.push(i);
      connectedShapes.push(m_shape);
      var wheelsThere = carData.wheelsAt(i);
      var totWheelAdditions = [];
      var totSpringAdditions = [];
      for (var j = 0; j < wheelsThere.length; j++) {
        var wheelData = wheelsThere[j];
        if (wheelData.o) {
          var wheelColor = decodeRGB(
            carData.data.colors[
              (carData.data.wheels.indexOf(wheelData) + 8) %
                carData.data.colors.length
            ]
          );
          var wheelPos = Vec2(
            Math.cos(p_angle) * carData.data.lengths[i] * carScale,
            Math.sin(p_angle) * carData.data.lengths[i] * carScale
          )
            .add(center_vec)
            .sub(
              Vec2(
                (Math.cos(wheelData.axelAngle) * carData.maxRadius * carScale) /
                  3,
                (Math.sin(wheelData.axelAngle) * carData.maxRadius * carScale) /
                  3
              )
            );
          var wheelAxelPos = Vec2(
            (Math.cos(wheelData.axelAngle) *
              0.2 *
              carScale *
              carData.maxRadius) /
              3,
            (Math.sin(wheelData.axelAngle) *
              0.2 *
              carScale *
              carData.maxRadius) /
              3
          ).add(wheelPos);
          var spring = world.createDynamicBody(wheelAxelPos);

          var s_fix = spring.createFixture(
            Box(
              (0.2 * carScale * carData.maxRadius) / 1.5,
              (0.05 * carScale * carData.maxRadius) / 1.5,
              Vec2(0, 0),
              wheelData.axelAngle
            ),
            springShapeDef
          );
          var s_b_fix = m_piece
            .getBody()
            .createFixture(
              Box(
                (0.2 * carScale * carData.maxRadius) / 1.5,
                (0.1 * carScale * carData.maxRadius) / 1.5,
                Vec2(
                  Math.cos(p_angle) * carData.data.lengths[i] * carScale,
                  Math.sin(p_angle) * carData.data.lengths[i] * carScale
                ),
                wheelData.axelAngle
              ),
              springShapeDef
            );
          var wheel = world.createDynamicBody(wheelPos);
          var w_fix = wheel.createFixture(
            Circle(wheelData.r * carScale * 0.89),
            wheelFD
          );
          w_fix.render = {
            fill: PALETTE.BLACK,
            layer: 7,
          };
          var colorLerp = 1;
          /*s_b_fix.render = {
  fill : "rgba(" + wheelColor.r * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.g * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.b * (1 - colorLerp) + 255 * colorLerp + ",1)", //"hsla(" + Math.random() * 360 + ",100%,50%,0.5)"
  stroke : "rgba(" + wheelColor.r * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.g * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.b * (1 - colorLerp) + 255 * colorLerp + ",0.75)",
  layer:5
          };
  s_fix.render = {
          fill: "rgba(" + wheelColor.r * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.g * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.b * (1 - colorLerp) + 255 * colorLerp + ",1)", //"hsla(" + Math.random() * 360 + ",100%,50%,0.5)"
          stroke: "rgba(" + wheelColor.r * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.g * (1 - colorLerp) + 255 * colorLerp + "," + wheelColor.b * (1 - colorLerp) + 255 * colorLerp + ",0.75)",
          layer:4
  
        };*/

          let m =
            carData.data.colors[
              (carData.data.wheels.indexOf(wheelData) + 8) %
                carData.data.colors.length
            ] || 0;
          var matHex = cols[m % cols.length]; //
          // matHex = convertToMaterial(
          //   (
          //     carData.data.colors[
          //       (carData.data.wheels.indexOf(wheelData) + 8) %
          //         carData.data.colors.length
          //     ] || 0
          //   )
          //     .toString(16)
          //     .padStart(6, "0")
          // );
          s_b_fix.render = {
            fill: matHex, //"hsla(" + Math.random() * 360 + ",100%,50%,0.5)"
            stroke: matHex,
            layer: 9,
          };
          s_fix.render = {
            fill: matHex, //"hsla(" + Math.random() * 360 + ",100%,50%,0.5)"
            stroke: matHex,
            layer: 8,
          };
          var bounceJoint = world.createJoint(
            PrismaticJoint(
              {
                enableMotor: true,
                lowerTranslation: (-carData.maxRadius * carScale) / 3,
                upperTranslation: ((carData.maxRadius * carScale) / 3) * 0.075,
                enableLimit: true,
              },
              m_piece.getBody(),
              spring,
              wheel.getWorldCenter(),
              Vec2(
                -Math.cos(wheelData.axelAngle) / 1,
                -Math.sin(wheelData.axelAngle) / 1
              )
            )
          );

          var turnJoint = world.createJoint(
            RevoluteJoint(
              {
                motorSpeed: -SPEED,
                maxMotorTorque: 42 / 2,
                enableMotor: true,
                // frequencyHz: 4,
                // dampingRatio: 0.1
              },
              s_fix.getBody(),
              wheel,
              wheel.getWorldCenter()
            )
          );
          wheelJoints.push(turnJoint);
          totWheelAdditions.push(turnJoint);
          wheels.push(wheel);
          wheelsF.push(w_fix);

          springJoints.push(bounceJoint);
          totSpringAdditions.push(bounceJoint);
          springs.push(spring);
          springsF.push(s_fix);
          lowestY = Math.min(lowestY, w_fix.getAABB(0).lowerBound.y);
          m_piece.getBody().resetMassData();
        }
      }
      connectedPartsWheels.push([totWheelAdditions]);
      connectedPartsSprings.push([totSpringAdditions]);
      p_angle = new_p_angle;
    }
    lowestY = lowestY - 0.5; //+0.1*carScale;
    boxCarRef.current.resetMassData();
    boxCarRef.current.setPosition(
      Vec2(
        boxCarRef.current.getPosition().x,
        boxCarRef.current.getPosition().y - lowestY
      )
    );
    for (var i = 0; i < springsF.length; i++) {
      let toTransform = springsF[i].m_body;
      toTransform.setPosition(
        Vec2(toTransform.getPosition().x, toTransform.getPosition().y - lowestY)
      );
    }
    for (var i = 0; i < wheelsF.length; i++) {
      let toTransform = wheelsF[i].m_body;
      toTransform.setPosition(
        Vec2(toTransform.getPosition().x, toTransform.getPosition().y - lowestY)
      );
    }
    carScoreRef.current = 0;
    cameraRef.current.x = 0;
    restartCurrentRef.current = 0;
    distTicksRef.current = 0;
    currentTicksRef.current = 0;
    genXRef.current = -200;
    destroyGround();
    genGround();
    updateScoreTable();
  }
  switchCar(true);
  world.on("post-solve", function (contact, impulse) {
    var a = contact;
    while (a) {
      for (var j = 0; j < connectedParts.length; j++) {
        var m_piece = connectedParts[j];
        var strength = (50 * connectedParts[j].m_body.m_mass) / 2; //Math.sqrt(connectedPartsArea[j]) * 3;
        //console.log("s",strength);
        if (
          (a.getFixtureA() == m_piece &&
            connectedPartsOld.indexOf(a.getFixtureB()) < 0 &&
            wheelsF.indexOf(a.getFixtureB()) < 0) ||
          (a.getFixtureB() == m_piece &&
            connectedPartsOld.indexOf(a.getFixtureA()) < 0 &&
            wheelsF.indexOf(a.getFixtureA()) < 0)
        ) {
          var partBreak = false;
          var impulseSum = 0;
          for (var i = 0; i < a.v_points.length; i++) {
            if (a.v_points[i].normalImpulse > strength) partBreak = true;
          }
          if (partBreak) partsToBreak.push(m_piece);
        }
      }
      a = a.m_next;
    }
  });
  //Break can only be called in step
  function Break(m_piece: Fixture) {
    if (connectedParts.indexOf(m_piece) >= 0) {
      var mIndex = connectedParts.indexOf(m_piece);
      var m_shape = connectedShapes.splice(
        connectedParts.indexOf(m_piece),
        1
      )[0];
      var m_area = connectedPartsArea.splice(
        connectedParts.indexOf(m_piece),
        1
      )[0];
      var m_index = connectedPartsI.splice(
        connectedParts.indexOf(m_piece),
        1
      )[0];
      var m_wheels = connectedPartsWheels.splice(
        connectedParts.indexOf(m_piece),
        1
      )[0];
      var m_springs = connectedPartsSprings.splice(
        connectedParts.indexOf(m_piece),
        1
      )[0];
      connectedParts.splice(connectedParts.indexOf(m_piece), 1);
      // Create two bodies from one.
      var f1 = boxCarRef.current.m_fixtureList;
      if (!f1?.m_shape) return;
      if (!f1?.getBody()) return;
      var index = connectedParts.indexOf(f1);
      var body1 = f1.getBody();
      var center = body1.getWorldCenter();
      if (m_wheels[1]) {
        for (var j = 0; j < m_wheels[1].length; j++) {
          connectedSpringsOld.push(
            springs.splice(springs.indexOf(m_springs[1][j].m_bodyB), 1)[0]
          );
          connectedWheelsOld.push(
            wheels.splice(wheels.indexOf(m_wheels[1][j].m_bodyB), 1)[0]
          );
          world.destroyJoint(m_wheels[1][j]);
          world.destroyJoint(m_springs[1][j]);
        }
      }
      var prevIndexInList = connectedPartsI.indexOf(
        (m_index + carDNA.bodyParts - 1) % carDNA.bodyParts
      );
      if (prevIndexInList >= 0 && doubleWheelParent) {
        connectedPartsWheels[prevIndexInList][1] = m_wheels[0];
        connectedPartsSprings[prevIndexInList][1] = m_springs[0];

        for (var j = 0; j < m_springs[0].length; j++) {
          m_springs[0][j].m_bodyA = connectedParts[prevIndexInList].m_body;
        }
      } else {
        for (var j = 0; j < m_wheels[0].length; j++) {
          connectedWheelsOld.push(
            wheels.splice(wheels.indexOf(m_wheels[0][j].m_bodyB), 1)[0]
          );
          world.destroyJoint(m_wheels[0][j]);
          connectedSpringsOld.push(
            wheels.splice(springs.indexOf(m_springs[0][j].m_bodyB), 1)[0]
          );
          world.destroyJoint(m_springs[0][j]);
        }
      }
      var renderData = m_piece.render;
      boxCarRef.current.destroyFixture(m_piece);
      m_piece = null;
      var body2 = world.createBody({
        type: "dynamic",
        position: body1.getPosition(),
        angle: body1.getAngle(),
      });
      m_piece = body2.createFixture(m_shape, bodyBrokeShapeDef);
      m_piece.render = renderData;
      m_piece.render.layer = 2;
      connectedPartsOld.push(m_piece);
      // Compute consistent velocities for new bodies based on cached velocity.
      var center1 = body1.getWorldCenter();
      var center2 = body2.getWorldCenter();
      var velocity1 = Vec2.add(
        m_velocity,
        Vec2.cross(m_angularVelocity, Vec2.sub(center1, center))
      );
      var velocity2 = Vec2.add(
        m_velocity,
        Vec2.cross(m_angularVelocity, Vec2.sub(center2, center))
      );
      body1.setAngularVelocity(m_angularVelocity);
      body1.setLinearVelocity(velocity1);
      body2.setAngularVelocity(m_angularVelocity);
      body2.setLinearVelocity(velocity2);
      boxCarRef.current.resetMassData();
    }
  }
  // window.setInterval(resetGround, 10);
  function tick() {
    // resetGround();
    genGround();
    var cMass = boxCarRef.current.m_mass;
    try {
      for (var j = 0; j < wheelJoints.length; j++) {
        if (wheelJoints[j].m_bodyB) {
          if (wheelJoints[j].m_bodyB.m_mass) {
            cMass += wheelJoints[j].m_bodyB.m_mass;
          }
        }
        if (springJoints[j].m_bodyB) {
          cMass += springJoints[j].m_bodyB.m_mass;
        }
      }
    } catch (e) {}
    cMass = cMass / carScale / carScale;
    var torque = ((MASS_MULT * GRAVITY) / wheelJoints.length) * cMass;
    var baseSpringForce = (7.5 * cMass) / 6;
    for (var j = 0; j < wheelJoints.length; j++) {
      //wheelJoints[j].setMotorSpeed(-SPEED);
      //wheelJoints[j].enableMotor(true);
      if (wheelJoints[j].m_bodyB) {
        wheelJoints[j].setMaxMotorTorque(torque * 2);
      }
      springJoints[j].setMotorSpeed(SPEED);
      springJoints[j].enableMotor(true);
      if (springJoints[j].m_bodyB) {
        var force = 0;
        springJoints[j].setMaxMotorForce(
          baseSpringForce +
            (40 / 40) *
              baseSpringForce *
              Math.pow(
                (5 * springJoints[j].getJointTranslation()) /
                  carScale /
                  ((carDNA.maxRadius * carScale) / 3),
                2
              )
        );
        //console.log(springJoints[j].getJointTranslation());
        springJoints[j].setMotorSpeed(
          ((-20 / 20) * 5 * springJoints[j].getJointTranslation()) /
            carScale /
            ((carDNA.maxRadius * carScale) / 3)
        );

        //springJoints[j].setMaxMotorForce(force  );
      }
    }
    restartCurrentRef.current++;
    currentTicksRef.current++;
    var cp = boxCarRef.current.getPosition();
    cameraRef.current.x = cp.x;
    cameraRef.current.y = -cp.y;
    updateProgress(cp.x);
    if (
      restartCurrentRef.current >= restartTicksRef.current ||
      connectedParts.length < 3
    ) {
      switchCar();
    }
    if (partsToBreak.length > 0) {
      for (var i = 0; i < partsToBreak.length; i++) {
        Break(partsToBreak[i]);
      }
      partsToBreak = [];
    }
    m_velocity = boxCarRef.current.getLinearVelocity();
    m_angularVelocity = boxCarRef.current.getAngularVelocity();
  }
  function loop() {
    for (var i = 0; i < simSpeed; i++) {
      let paused = false;
      if (!paused) {
        let cb = { af: true, simSpeed: 100 };
        if (autoFast !== cb.af) {
          simSpeed = 10;
        }
        autoFast = cb.af;
        //autoFast=false;
        if (autoFast) {
          if (carScoreRef.current > worstScore()) {
            simSpeed = 10;
          } else {
            simSpeed = 100;
          }
        } else {
          simSpeed = cb.simSpeed; //document.getElementById("sim-speed").value;
        }

        setScore(
          Math.max(boxCarRef.current.getPosition().x, carScoreRef.current)
        );
        // document.querySelectorAll(".score-text")[0].innerText =
        //   "Score: " +
        //   Math.round(Math.max(boxCarRef.current.getPosition().x, carScore) * 100) / 100;
        world.step(1 / 75);
        var tickStart = new Date().getTime();
        tick();
        var t = new Date().getTime() - tickStart;
        //tickSpeed=t/2+tickSpeed/2;
        //console.log(tickSpeed/2+t/2,t);
      }
    }
  }
  return () => {
    loop();
  };
};
