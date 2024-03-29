import { convertNumberToMaterial } from "../material-color";

export function encodeRGB(color:{r:number,g:number,b:number}) {
  return (
    (Math.floor(color.r) * 256 + Math.floor(color.g)) * 256 +
    Math.floor(color.b)
  );
}
export function decodeRGB(number:number) {
  return {
    r: Math.floor(number / 256 / 256) % 256,
    g: Math.floor(number / 256) % 256,
    b: Math.floor(number) % 256,
  };
}
export class Car {
  bodyParts = 8;
  maxWheels = 4;
  wheelProb = 0.5;
  maxLength = 10;
  maxRadius = 5;
  minRadius = 1;
  minAngleWeight = 0.32;
  maxAngleWeight = 6.4;
  score = 0;
  data: {
    lengths: number[];
    angleWeights: number[];
    wheels: {
      index: number;
      r: number;
      o: boolean;
      axelAngle: number;
    }[];
    colors: number[];
  } = {
    lengths: [],
    angleWeights: [],
    wheels: [],
    colors: [],
  };
  constructor(
    data?: {
      lengths: number[];
      angleWeights: number[];
      wheels: any[];
      colors: any[];
    },
    maxWheels?: number,
    wheelProbablity?: number
  ) {
    var wheelMax = this.maxWheels;
    if (maxWheels) wheelMax = maxWheels;
    var wheelProb = this.wheelProb;
    if (wheelProbablity) wheelProb = wheelProbablity;
    if (data) {
      this.data = data;
    } else {
      this.data = {
        lengths: [],
        angleWeights: [],
        wheels: [],
        colors: [],
      };
      for (var i = 0; i < this.bodyParts; i++) {
        this.data.lengths.push(
          this.maxLength * ((Math.random() / 4) * 3 + 0.25)
        );
        this.data.angleWeights.push(0.5 + Math.random());
      }
      for (var i = 0; i < this.bodyParts * 2; i++) {
        this.data.colors.push(
          (Math.floor(Math.random() * 256) * 256 +
            Math.floor(Math.random() * 256)) *
            256 +
            Math.floor(Math.random() * 256)
        );
      }
      for (var i = 0; i < 2; i++) {
        this.data.wheels.push({
          index: Math.floor(Math.random() * this.bodyParts),
          r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius,
          o: true,
          axelAngle: (i / this.bodyParts) * Math.PI * 2,
        });
      }
      for (var i = 0; i < wheelMax - 2; i++) {
        this.data.wheels.push({
          index: Math.floor(Math.random() * this.bodyParts),
          r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius,
          o: Math.random() < wheelProb,
          axelAngle: (i / this.bodyParts) * Math.PI * 2,
        });
      }
    }
    //this.fixAngleWeights();
    // this.materialize();
  }
  fixAngleWeights() {
    var total = 0;
    for (var i = 0; i < this.bodyParts; i++) {
      total += this.data.angleWeights[i];
    }
    for (var i = 0; i < this.bodyParts; i++) {
      this.data.angleWeights[i] = Math.min(
        Math.max(
          (this.data.angleWeights[i] / total) * this.bodyParts,
          this.minAngleWeight
        ),
        this.maxAngleWeight
      );
    }
  }
  importCar = async function (str: string) {
    var ret = new Car();
    try {
      var list:any[] = [];
      if (str.split(",").length < 3) {
        list = await hashToList(str);
      } else {
        list = str.split(",");
      }

      var data:{lengths: number[],
        angleWeights: number[],
        wheels: unknown[],
        colors: number[],} = {
        lengths: [],
        angleWeights: [],
        wheels: [],
        colors: [],
      };
      for (var i = 0; i < 8; i++) {
        data.lengths.push((ret.maxLength * parseFloat(list[i * 2 + 1])) / 3);
        data.angleWeights.push(parseFloat(list[i * 2]));
      }
      var wheelCount = parseInt(list[list.length - 1]);
      if (wheelCount > 32) {
        return null;
      }
      for (var i = 0; i < wheelCount; i++) {
        if ((list[16 + i * 3] ?? false) === false || list[16 + i * 3] === "") {
          return null;
        }
        data.wheels.push({
          index: parseInt(list[16 + i * 3]),
          r: (ret.maxRadius * parseFloat(list[16 + i * 3 + 2])) / 1.5,
          o: parseInt(list[16 + i * 3]) > -1,
          axelAngle: parseFloat(list[16 + i * 3 + 1]),
        });
      }
      for (var i = 0; i < 16; i++) {
        if ((list[40 + i] ?? false) === false || list[40 + i] === "") {
          return null;
        }
        data.colors.push(parseInt(list[40 + i]));
      }
      ret = new Car(data);
    } catch (e) {
      console.log("E", e);
      return null;
    }
    // ret.materialize();
    return ret;
  };
  materialize() {
    for (var i = 0; i < this.data.colors.length; i++) {
      this.data.colors[i] = convertNumberToMaterial(this.data.colors[i]);
    }
  }
  totalAngleWeights() {
    var total = 0;
    for (var i = 0; i < this.bodyParts; i++) {
      total += this.data.angleWeights[i];
    }
    return total;
  }
  compareWheels(a, b) {
    return 0;
    return (
      (a.r + (b.o ? this.maxRadius : 0) - b.r - (a.o ? this.maxRadius : 0)) /
        2 /
        this.maxRadius +
      (a.index - b.index) * 2
    );
  }
  wheelsAt(index:number) {
    var wheels = [];
    for (var i = 0; i < this.data.wheels.length; i++) {
      if (this.data.wheels[i].index == index) {
        wheels.push(this.data.wheels[i]);
      }
    }
    wheels.sort(this.compareWheels);
    return wheels;
  }
  sectionSimiliarity(other, indexA, indexB) {
    var a = {
      l: this.data.lengths[indexA] / this.maxLength,
      s: this.data.angleWeights[indexA] / this.totalAngleWeights(),
      w: this.wheelsAt(indexA),
    };
    var b = {
      l: other.data.lengths[indexB] / other.maxLength,
      s: other.data.angleWeights[indexB] / other.totalAngleWeights(),
      w: other.wheelsAt(indexB),
    };
    return 0;
  }
  bestMap(other) {
    var mapping = [];
    for (var i = 0; i < this.bodyParts; i++) {
      mapping.push(i);
    }
  }
  getAreaOfPiece(index) {
    index = ((index % this.bodyParts) + this.bodyParts) % this.bodyParts;
    var total = 0;
    for (var i = 0; i < this.bodyParts; i++) {
      total += this.data.angleWeights[i];
    }
    var angle =
      (Math.PI * 2 * this.data.angleWeights[(index + 1) % this.bodyParts]) /
      total;
    var area =
      (Math.sin(angle) *
        this.data.lengths[index] *
        this.data.lengths[(index + 1) % this.bodyParts]) /
      2;
    return area;
  }
  exportCar() {
    var string = [];
    var curAngle = 0;
    // this.fixAngleWeights();
    var total = 0;
    for (var i = 0; i < this.bodyParts; i++) {
      total += this.data.angleWeights[i];
    }
    var angles = [];
    for (var i = 0; i < this.bodyParts; i++) {
      string.push(this.data.angleWeights[i]);
      string.push((this.data.lengths[i] / this.maxLength) * 3);
      curAngle += (Math.PI * 2 * this.data.angleWeights[i]) / total;
      angles.push(curAngle);
    }
    angles.push(curAngle);
    var wheelCount = 0;
    for (var i = 0; i < this.data.wheels.length; i++) {
      if (this.data.wheels[i].o) {
        string.push(this.data.wheels[i].index);
        string.push(this.data.wheels[i].axelAngle);
        string.push((this.data.wheels[i].r / this.maxRadius) * 1.5); //*1.25)
        //console.log("wheel");
        wheelCount++;
      }
    }
    for (var i = 0; i < this.bodyParts - wheelCount; i++) {
      string.push("NaN");
      string.push(0.1);
      string.push(0.1);
    }
    for (var i = 0; i < this.bodyParts * 2; i++) {
      string.push(this.data.colors[i]);
    }
    string.push(wheelCount);
    for (var i = 0; i < string.length; i++) {
      //string[i]=Math.round(string[i]*100)/100;
    }
    return string.join(",");
  }
  breed(other: Car, maxWheels?: number, wheelProbablity?: number) {
    var interp =
      Math.max(1, this.score) /
      (Math.max(1, this.score) + Math.max(1, other.score));
    interp = Math.sign(interp - 0.5) * (0.5 + 0.25 * Math.random()) + 0.5;
    var interpL = Math.random();
    var wheelMax = maxWheels ?? this.maxWheels;
    var wheelProb = wheelProbablity ?? this.wheelProb;
    var mutationRate = 0.001;
    var explorationRate = 0.025;
    this.fixAngleWeights();
    other.fixAngleWeights();
    this.data.wheels.sort(this.compareWheels);
    other.data.wheels.sort(this.compareWheels);
    var offspring = new Car();
    offspring.score = this.score * interp + other.score * (1 - interp);
    for (var i = 0; i < this.bodyParts; i++) {
      if (Math.random() > explorationRate) {
        var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
        lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
        offspring.data.lengths[i] = Math.min(
          Math.max(
            (this.data.lengths[i] * lerp + other.data.lengths[i] * (1 - lerp)) *
              (1 - mutationRate) +
              mutationRate * Math.random() * this.maxLength,
            0
          ),
          this.maxLength
        );
        offspring.data.angleWeights[i] = Math.max(
          ((this.data.angleWeights[i] / this.totalAngleWeights()) * lerp +
            (other.data.angleWeights[i] / other.totalAngleWeights()) *
              (1 - lerp)) *
            (1 - mutationRate) +
            mutationRate *
              (Math.random() * (this.maxAngleWeight - this.minAngleWeight) +
                this.minAngleWeight),
          0
        );
      }
    }
    /*for (var i = 0; i < this.bodyParts; i++) {
            if (Math.random() > explorationRate) {
                var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
                lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
                offspring.data.angleWeights[i] = Math.max((this.data.angleWeights[i] / this.totalAngleWeights() * lerp + other.data.angleWeights[i] / other.totalAngleWeights() * (1 - lerp)) * (1 - mutationRate) + mutationRate * Math.random() * 1 / this.bodyParts, 0);
            }
        }*/
    for (var i = 0; i < this.bodyParts * 2; i++) {
      if (Math.random() > explorationRate) {
        var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
        lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
        var cA = decodeRGB(this.data.colors[i]);
        var cB = decodeRGB(other.data.colors[i]);
        var cO = decodeRGB(0);
        cO.r = Math.min(
          Math.max(
            (cA.r * lerp + cB.r * (1 - lerp)) * (1 - mutationRate) +
              mutationRate * Math.random() * 256,
            0
          ),
          255
        );
        cO.g = Math.min(
          Math.max(
            (cA.g * lerp + cB.g * (1 - lerp)) * (1 - mutationRate) +
              mutationRate * Math.random() * 256,
            0
          ),
          255
        );
        cO.b = Math.min(
          Math.max(
            (cA.b * lerp + cB.b * (1 - lerp)) * (1 - mutationRate) +
              mutationRate * Math.random() * 256,
            0
          ),
          255
        );

        offspring.data.colors[i] = encodeRGB(cO);
      }
    }
    offspring.data.wheels = [];
    for (
      var i = 0;
      i <
      Math.min(
        Math.max(this.data.wheels.length, other.data.wheels.length),
        this.maxWheels
      );
      i++
    ) {
      var aHaveWheel = i < this.data.wheels.length;
      var bHaveWheel = i < other.data.wheels.length;
      var a = aHaveWheel ? this.data.wheels[i] : other.data.wheels[i];
      var b = aHaveWheel && bHaveWheel ? other.data.wheels[i] : a;
      var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
      lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
      var aR = a.o ? a.r : 0;
      var bR = b.o ? b.r : 0;
      var newR = Math.min(
        Math.max(
          (a.r * lerp + b.r * (1 - lerp)) * (1 - mutationRate) +
            mutationRate * Math.random() * this.maxRadius,
          this.minRadius
        ),
        this.maxRadius
      );
      var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
      lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
      var newO =
        ((a.o ? 1 : 0) * lerp + (b.o ? 1 : 0) * (1 - lerp)) *
          (1 - mutationRate) +
          mutationRate * Math.random() >
        0.5;
      var dirIndexA = {
        x: Math.cos((a.index * Math.PI * 2) / this.bodyParts),
        y: Math.sin((a.index * Math.PI * 2) / this.bodyParts),
      };
      var dirIndexB = {
        x: Math.cos((b.index * Math.PI * 2) / this.bodyParts),
        y: Math.sin((b.index * Math.PI * 2) / this.bodyParts),
      };
      var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
      lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
      var dirIndex = {
        x: dirIndexA.x * lerp + dirIndexB.x * (1 - lerp),
        y: dirIndexA.y * lerp + dirIndexB.y * (1 - lerp),
      };
      var newIndex = Math.floor(
        (Math.atan2(dirIndex.y, dirIndex.x) / Math.PI / 2) * this.bodyParts +
          0.05
      );
      var newRandIndex = Math.floor(Math.random() * this.bodyParts);
      var dirIndexA = {
        x: Math.cos((newRandIndex * Math.PI * 2) / this.bodyParts),
        y: Math.sin((newRandIndex * Math.PI * 2) / this.bodyParts),
      };
      var dirIndexB = {
        x: Math.cos((newIndex * Math.PI * 2) / this.bodyParts),
        y: Math.sin((newIndex * Math.PI * 2) / this.bodyParts),
      };
      lerp = mutationRate;
      dirIndex = {
        x: dirIndexA.x * lerp + dirIndexB.x * (1 - lerp),
        y: dirIndexA.y * lerp + dirIndexB.y * (1 - lerp),
      };
      newIndex =
        ((Math.floor(
          (Math.atan2(dirIndex.y, dirIndex.x) / Math.PI / 2) * this.bodyParts +
            0.05
        ) %
          this.bodyParts) +
          this.bodyParts) %
        this.bodyParts;
      if (Math.random() < explorationRate)
        newIndex = Math.floor(Math.random() * this.bodyParts);
      if (newR <= this.minRadius) newO = false;
      if (Math.random() < explorationRate) {
        newO = Math.random() > 0.1;
        newR =
          (this.maxRadius - this.minRadius) * Math.random() + this.minRadius;
      }
      var newWheel = {
        index: newIndex,
        r: newR,
        o: newO,
        axelAngle: (newIndex / this.bodyParts) * Math.PI * 2,
      };
      offspring.data.wheels.push(newWheel);
    }
    var wheelsNeeded = maxWheels - offspring.data.wheels.length;
    if (wheelsNeeded > 0) {
      for (var j = 0; j < wheelsNeeded; j++) {
        var ind = Math.floor(Math.random() * this.bodyParts);
        offspring.data.wheels.push({
          index: ind + 0,
          r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius,
          o: Math.random() < wheelProb,
          axelAngle: (ind / this.bodyParts) * Math.PI * 2,
        });
      }
    }
    if (wheelsNeeded < 0) {
      for (var j = 0; j < -wheelsNeeded; j++) {
        offspring.data.wheels.splice(
          Math.floor(Math.random() * offspring.data.wheels.length),
          1
        );
      }
    }
    var activatedWheels = 0;
    for (var i = 0; i < offspring.data.wheels.length; i++) {
      if (offspring.data.wheels[i].o) {
        activatedWheels++;
      }
    }

    var wheelActivationsNeeded =
      offspring.data.wheels.length * wheelProb - activatedWheels;
    if (wheelActivationsNeeded > 0) {
      for (var j = 0; j < wheelActivationsNeeded; j++) {
        var wi = Math.floor(Math.random() * offspring.data.wheels.length);
        offspring.data.wheels[wi].o =
          Math.random() < 0.5 || offspring.data.wheels[wi].o;
      }
    }
    if (Math.random() < explorationRate) {
      if (
        offspring.data.wheels.length < this.maxWheels &&
        Math.random() < 0.5
      ) {
        var ind = Math.floor(Math.random() * this.bodyParts);
        offspring.data.wheels.push({
          index: ind,
          r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius,
          o: Math.random() < 0.1,
          axelAngle: (ind / this.bodyParts) * Math.PI * 2,
        });
      } else {
        offspring.data.wheels.splice(
          Math.floor(Math.random() * offspring.data.wheels.length),
          1
        );
      }
    }
    // offspring.materialize();
    offspring.fixAngleWeights();
    return offspring;
  }
  breed2(other, maxWheels, wheelProbablity) {
    var interp =
      Math.max(1, this.score) /
      (Math.max(1, this.score) + Math.max(1, other.score));
    var interpL = 2;
    var wheelMax = this.maxWheels;
    var wheelProb = this.wheelProb;
    if (maxWheels) wheelMax = maxWheels;
    var wheelProb = this.wheelProb;
    if (wheelProbablity) wheelProb = wheelProbablity;
    var mutationRateProb = 0.1;
    var explorationRate = 0.05;
    this.fixAngleWeights();
    other.fixAngleWeights();
    this.data.wheels.sort(this.compareWheels);
    other.data.wheels.sort(this.compareWheels);
    var offspring = new Car();
    offspring.score = this.score * interp + other.score * (1 - interp);
    for (var i = 0; i < this.bodyParts; i++) {
      if (Math.random() > explorationRate) {
        var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
        lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
        var mutationRate = mutationRate > Math.random() ? 1 : 0;
        offspring.data.lengths[i] = Math.min(
          Math.max(
            (this.data.lengths[i] * lerp + other.data.lengths[i] * (1 - lerp)) *
              (1 - mutationRate) +
              mutationRate * Math.random() * this.maxLength,
            0
          ),
          this.maxLength
        );
        var mutationRate = mutationRate > Math.random() ? 1 : 0;
        offspring.data.angleWeights[i] = Math.max(
          ((this.data.angleWeights[i] / this.totalAngleWeights()) * lerp +
            (other.data.angleWeights[i] / other.totalAngleWeights()) *
              (1 - lerp)) *
            (1 - mutationRate) +
            (mutationRate * Math.random() * 1) / this.bodyParts,
          0
        );
      }
    }
    /*for (var i = 0; i < this.bodyParts; i++) {
            if (Math.random() > explorationRate) {
                var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
                lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
                offspring.data.angleWeights[i] = Math.max((this.data.angleWeights[i] / this.totalAngleWeights() * lerp + other.data.angleWeights[i] / other.totalAngleWeights() * (1 - lerp)) * (1 - mutationRate) + mutationRate * Math.random() * 1 / this.bodyParts, 0);
            }
        }*/
    for (var i = 0; i < this.bodyParts * 2; i++) {
      if (Math.random() > explorationRate) {
        var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
        lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
        var cA = decodeRGB(this.data.colors[i]);
        var cB = decodeRGB(other.data.colors[i]);
        var cO = decodeRGB(0);
        var mutationRate = mutationRate > Math.random() ? 1 : 0;
        cO.r = Math.min(
          Math.max(
            (cA.r * lerp + cB.r * (1 - lerp)) * (1 - mutationRate) +
              mutationRate * Math.random() * 256,
            0
          ),
          255
        );
        var mutationRate = mutationRate > Math.random() ? 1 : 0;
        cO.g = Math.min(
          Math.max(
            (cA.g * lerp + cB.g * (1 - lerp)) * (1 - mutationRate) +
              mutationRate * Math.random() * 256,
            0
          ),
          255
        );
        var mutationRate = mutationRate > Math.random() ? 1 : 0;
        cO.b = Math.min(
          Math.max(
            (cA.b * lerp + cB.b * (1 - lerp)) * (1 - mutationRate) +
              mutationRate * Math.random() * 256,
            0
          ),
          255
        );

        offspring.data.colors[i] = encodeRGB(cO);
      }
    }
    offspring.data.wheels = [];
    for (
      var i = 0;
      i <
      Math.min(
        Math.max(this.data.wheels.length, other.data.wheels.length),
        this.maxWheels
      );
      i++
    ) {
      var aHaveWheel = i < this.data.wheels.length;
      var bHaveWheel = i < other.data.wheels.length;
      var a = aHaveWheel ? this.data.wheels[i] : other.data.wheels[i];
      var b = aHaveWheel && bHaveWheel ? other.data.wheels[i] : a;
      var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
      lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
      var aR = a.o ? a.r : 0;
      var bR = b.o ? b.r : 0;
      var mutationRate = mutationRate > Math.random() ? 1 : 0;
      var newR = Math.min(
        Math.max(
          (a.r * lerp + b.r * (1 - lerp)) * (1 - mutationRate) +
            mutationRate * Math.random() * this.maxRadius,
          this.minRadius
        ),
        this.maxRadius
      );
      var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
      lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
      var mutationRate = mutationRate > Math.random() ? 1 : 0;
      var newO =
        ((a.o ? 1 : 0) * lerp + (b.o ? 1 : 0) * (1 - lerp)) *
          (1 - mutationRate) +
          mutationRate * Math.random() >
        0.5;
      var dirIndexA = {
        x: Math.cos((a.index * Math.PI * 2) / this.bodyParts),
        y: Math.sin((a.index * Math.PI * 2) / this.bodyParts),
      };
      var dirIndexB = {
        x: Math.cos((b.index * Math.PI * 2) / this.bodyParts),
        y: Math.sin((b.index * Math.PI * 2) / this.bodyParts),
      };
      var lerp = (Math.random() - 0.5) / 0.99 + 0.5;
      lerp = 0.5 + (lerp - 0.5) * (1 - interpL) + (interp - 0.5) * interpL;
      var dirIndex = {
        x: dirIndexA.x * lerp + dirIndexB.x * (1 - lerp),
        y: dirIndexA.y * lerp + dirIndexB.y * (1 - lerp),
      };
      var newIndex = Math.floor(
        (Math.atan2(dirIndex.y, dirIndex.x) / Math.PI / 2) * this.bodyParts
      );
      var newRandIndex = Math.floor(Math.random() * this.bodyParts);
      var dirIndexA = {
        x: Math.cos((newRandIndex * Math.PI * 2) / this.bodyParts),
        y: Math.sin((newRandIndex * Math.PI * 2) / this.bodyParts),
      };
      var dirIndexB = {
        x: Math.cos((newIndex * Math.PI * 2) / this.bodyParts),
        y: Math.sin((newIndex * Math.PI * 2) / this.bodyParts),
      };
      lerp = mutationRate;
      dirIndex = {
        x: dirIndexA.x * lerp + dirIndexB.x * (1 - lerp),
        y: dirIndexA.y * lerp + dirIndexB.y * (1 - lerp),
      };
      var mutationRate = mutationRate > Math.random() ? 1 : 0;
      newIndex =
        (Math.floor(
          (Math.atan2(dirIndex.y, dirIndex.x) / Math.PI / 2) * this.bodyParts
        ) +
          this.bodyParts +
          this.bodyParts) %
        this.bodyParts;
      if (Math.random() < explorationRate)
        newIndex = Math.floor(Math.random() * this.bodyParts);
      if (newR <= this.minRadius) newO = false;
      if (Math.random() < explorationRate) {
        newO = Math.random() > 0.1;
        newR =
          (this.maxRadius - this.minRadius) * Math.random() + this.minRadius;
      }
      var newWheel = {
        index: newIndex,
        r: newR,
        o: newO,
        axelAngle: (newIndex / this.bodyParts) * Math.PI * 2,
      };
      offspring.data.wheels.push(newWheel);
    }
    var wheelsNeeded = maxWheels - offspring.data.wheels.length;
    if (wheelsNeeded > 0) {
      for (var j = 0; j < wheelsNeeded; j++) {
        var ind = Math.floor(Math.random() * this.bodyParts);
        offspring.data.wheels.push({
          index: ind + 0,
          r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius,
          o: Math.random() < wheelProb,
          axelAngle: (ind / this.bodyParts) * Math.PI * 2,
        });
      }
    }
    if (wheelsNeeded < 0) {
      for (var j = 0; j < -wheelsNeeded; j++) {
        offspring.data.wheels.splice(
          Math.floor(Math.random() * offspring.data.wheels.length),
          1
        );
      }
    }
    var activatedWheels = 0;
    for (var i = 0; i < offspring.data.wheels.length; i++) {
      if (offspring.data.wheels[i].o) {
        activatedWheels++;
      }
    }

    var wheelActivationsNeeded =
      offspring.data.wheels.length * wheelProb - activatedWheels;
    if (wheelActivationsNeeded > 0) {
      for (var j = 0; j < wheelActivationsNeeded; j++) {
        var wi = Math.floor(Math.random() * offspring.data.wheels.length);
        offspring.data.wheels[wi].o =
          Math.random() < 0.5 || offspring.data.wheels[wi].o;
      }
    }
    if (Math.random() < explorationRate) {
      if (
        offspring.data.wheels.length < this.maxWheels &&
        Math.random() < 0.5
      ) {
        var ind = Math.floor(Math.random() * this.bodyParts);
        offspring.data.wheels.push({
          index: ind,
          r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius,
          o: Math.random() < 0.1,
          axelAngle: (ind / this.bodyParts) * Math.PI * 2,
        });
      } else {
        offspring.data.wheels.splice(
          Math.floor(Math.random() * offspring.data.wheels.length),
          1
        );
      }
    }
    // offspring.materialize();
    offspring.fixAngleWeights();
    return offspring;
  }
  clone() {
    this.data.wheels.sort(this.compareWheels);

    var offspring = new Car();
    for (var i = 0; i < this.bodyParts; i++) {
      offspring.data.lengths[i] = this.data.lengths[i] + 0;
      offspring.data.angleWeights[i] = this.data.angleWeights[i] + 0;
    }
    offspring.data.wheels = [];
    for (var i = 0; i < this.data.wheels.length; i++) {
      var w = this.data.wheels[i];
      var newWheel = {
        index: w.index + 0,
        r: w.r + 0,
        o: w.o && true,
        axelAngle: w.axelAngle + 0,
      };
      offspring.data.wheels.push(newWheel);
    }
    // offspring.materialize();
    return offspring;
  }
}

async function hashToList(str) {
  var carDat = await stringToData(str);
  // var decompressed = (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(str))).unzip()[0][0];
  //"#"+carDat.getInt32(40*8).toString(16).padStart(6, '0')
  var list = [];
  for (var i = 0; i < 16; i++) {
    list.push(carDat.getFloat64(i * 8));
  }
  for (var i = 0; i < 8; i++) {
    //list.push("w"); list.push(carDat.getInt32(i * 8 * 3 + 16 * 8 ) %8);
    var index = carDat.getInt32(i * 8 * 2.5 + 16 * 8);
    if (!(Math.abs(index) < 10)) {
      index = NaN;
    }
    list.push(index);
    list.push(carDat.getFloat64(i * 8 * 2.5 + 16 * 8 + 0.5 * 8));
    if (Math.abs(list[list.length - 1]) < Math.pow(2, -100)) {
      list[list.length - 1] = 0;
    }
    list.push(carDat.getFloat64(i * 8 * 2.5 + 16 * 8 + 1.5 * 8));
    if (Math.abs(list[list.length - 1]) < Math.pow(2, -100)) {
      list[list.length - 1] = 0;
    }
  }
  var wheels = (((carDat.getUint8(44 * 8 + 3) % 8) + 7) % 8) + 1;
  for (var i = 0; i < 16; i++) {
    var l = i * 4 + 36 * 8;
    if (l < carDat.byteLength) {
      list.push(carDat.getUint32(l));
    }
  }
  list.push(wheels);
  return list;
}
import pako from "pako";
async function stringToData(str) {
  return new DataView(
    pako.inflate(Uint8Array.from(atob(str), (c) => c.charCodeAt(0))).buffer
  );
}
