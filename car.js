function Car(data, maxWheels, wheelProbablity) {
    var wheelMax = this.maxWheels;
    if (maxWheels) wheelMax = maxWheels;
    var wheelProb = this.wheelProb;
    if (wheelProbablity) wheelProb = wheelProbablity;
    if (data) {
        this.data = data;
    } else {
        this.data = { lengths: [], angleWeights: [], wheels: [] };
        for (var i = 0; i < this.bodyParts; i++) {
            this.data.lengths.push(this.maxLength / 2 * (Math.random() / 4 * 3 + 0.25));
            this.data.angleWeights.push(0.5 + Math.random());
        }
        for (var i = 0; i < 2; i++) {
            this.data.wheels.push({ index: Math.floor(Math.random() * this.bodyParts), r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: true, axelAngle: i / this.bodyParts * Math.PI * 2 });
        }
        for (var i = 0; i < this.wheelMax - 2; i++) {
            this.data.wheels.push({ index: Math.floor(Math.random() * this.bodyParts), r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: Math.random() < wheelProb, axelAngle: i / this.bodyParts * Math.PI * 2 });
        }
    }
    this.fixAngleWeights();
}
Car.prototype.bodyParts = 8;
Car.prototype.maxWheels = 4;
Car.prototype.wheelProb = 0.5;
Car.prototype.maxLength = 100;
Car.prototype.maxRadius = 20;
Car.prototype.minRadius = 5;
Car.prototype.minAngleWeight = 0.5;
Car.prototype.maxAngleWeight = 2;
Car.prototype.fixAngleWeights = function () {
    var total = 0;
    for (var i = 0; i < this.bodyParts; i++) {
        total += this.data.angleWeights[i];
    }
    for (var i = 0; i < this.bodyParts; i++) {
        this.data.angleWeights[i] = Math.min(Math.max(this.data.angleWeights[i] / total * this.bodyParts, this.minAngleWeight), this.maxAngleWeight);
    }
}
Car.prototype.totalAngleWeights = function () {
    var total = 0;
    for (var i = 0; i < this.bodyParts; i++) {
        total += this.data.angleWeights[i];
    }
    return total;
}
Car.prototype.compareWheels = function (a, b) {
    return (a.r + (b.o ? this.maxRadius : 0) - b.r - (a.o ? this.maxRadius : 0)) / 2 / this.maxRadius + (a.index - b.index) * 2;
}
Car.prototype.wheelsAt = function (index) {
    var wheels = [];
    for (var i = 0; i < this.data.wheels.length; i++) {
        if (this.data.wheels[i].index == index) {
            wheels.push(this.data.wheels[i]);
        }
    }
    wheels.sort(this.compareWheels);
    return wheels;
}
Car.prototype.sectionSimiliarity = function (other, indexA, indexB) {
    var a = { l: this.data.lengths[indexA] / this.maxLength, s: this.data.angleWeights[indexA] / this.totalAngleWeights(), w: this.wheelsAt(indexA) };
    var b = { l: other.data.lengths[indexB] / other.maxLength, s: other.data.angleWeights[indexB] / other.totalAngleWeights(), w: other.wheelsAt(indexB) };
    return 0;

}
Car.prototype.bestMap = function (other) {
    var mapping = [];
    for (var i = 0; i < this.bodyParts; i++) {
        mapping.push(i);
    }
}
Car.prototype.breed = function (other, maxWheels, wheelProbablity) {
    var wheelMax = this.maxWheels;
    var wheelProb = this.wheelProb;
    if (maxWheels) wheelMax = maxWheels;
    var wheelProb = this.wheelProb;
    if (wheelProbablity) wheelProb = wheelProbablity;
    var mutationRate = 0.05;
    var explorationRate = 0.1;
    this.fixAngleWeights();
    other.fixAngleWeights();
    this.data.wheels.sort(this.compareWheels);
    other.data.wheels.sort(this.compareWheels);
    var offspring = new Car();
    for (var i = 0; i < this.bodyParts; i++) {
        if (Math.random() > explorationRate) {
            var lerp = (Math.random() - 0.5) / 10 + 0.5;
            offspring.data.lengths[i] = Math.min(Math.max((this.data.lengths[i] * lerp + other.data.lengths[i] * (1 - lerp)) * (1 - mutationRate) + mutationRate * Math.random() * this.maxLength, 0), this.maxLength);
        }
    }
    for (var i = 0; i < this.bodyParts; i++) {
        if (Math.random() > explorationRate) {
            var lerp = (Math.random() - 0.5) / 10 + 0.5;
            offspring.data.angleWeights[i] = Math.max((this.data.angleWeights[i] / this.totalAngleWeights() * lerp + other.data.angleWeights[i] / other.totalAngleWeights() * (1 - lerp)) * (1 - mutationRate) + mutationRate * Math.random() * 1 / this.bodyParts, 0);
        }
    }
    offspring.data.wheels = [];
    for (var i = 0; i < Math.min(Math.max(this.data.wheels.length, other.data.wheels.length), this.maxWheels); i++) {
        var aHaveWheel = i < this.data.wheels.length;
        var bHaveWheel = i < other.data.wheels.length;
        var a = aHaveWheel ? this.data.wheels[i] : other.data.wheels[i];
        var b = (aHaveWheel && bHaveWheel) ? other.data.wheels[i] : a;
        var lerp = (Math.random() - 0.5) / 10 + 0.5;
        var aR = a.o ? a.r : 0;
        var bR = b.o ? b.r : 0;
        var newR = Math.min(Math.max((a.r * lerp + b.r * (1 - lerp)) * (1 - mutationRate) + mutationRate * (Math.random()) * this.maxRadius, this.minRadius), this.maxRadius);
        var lerp = (Math.random() - 0.5) / 10 + 0.5;
        var newO = ((a.o ? 1 : 0) * lerp + (b.o ? 1 : 0) * (1 - lerp)) * (1 - mutationRate) + mutationRate * (Math.random()) > 0.5;
        var dirIndexA = { x: Math.cos(a.index * Math.PI * 2 / this.bodyParts), y: Math.sin(a.index * Math.PI * 2 / this.bodyParts) };
        var dirIndexB = { x: Math.cos(b.index * Math.PI * 2 / this.bodyParts), y: Math.sin(b.index * Math.PI * 2 / this.bodyParts) };
        var lerp = (Math.random() - 0.5) / 10 + 0.5;
        var dirIndex = { x: dirIndexA.x * lerp + dirIndexB.x * (1 - lerp), y: dirIndexA.y * lerp + dirIndexB.y * (1 - lerp) };
        var newIndex = Math.floor(Math.atan2(dirIndex.y, dirIndex.x) / Math.PI / 2 * this.bodyParts);
        var newRandIndex = Math.floor(Math.random() * this.bodyParts);
        var dirIndexA = { x: Math.cos(newRandIndex * Math.PI * 2 / this.bodyParts), y: Math.sin(newRandIndex * Math.PI * 2 / this.bodyParts) };
        var dirIndexB = { x: Math.cos(newIndex * Math.PI * 2 / this.bodyParts), y: Math.sin(newIndex * Math.PI * 2 / this.bodyParts) };
        lerp = mutationRate;
        dirIndex = { x: dirIndexA.x * lerp + dirIndexB.x * (1 - lerp), y: dirIndexA.y * lerp + dirIndexB.y * (1 - lerp) };
        newIndex = Math.floor(Math.atan2(dirIndex.y, dirIndex.x) / Math.PI / 2 * this.bodyParts);
        if (Math.random() < explorationRate) newIndex = Math.floor(Math.random() * this.bodyParts);
        if (newR <= this.minRadius) newO = false;
        if (Math.random() < explorationRate) {
            newO = Math.random() > 0.1;
            newR = (this.maxRadius - this.minRadius) * Math.random() + this.minRadius;
        }
        var newWheel = { index: newIndex, r: newR, o: newO, axelAngle: newIndex / this.bodyParts * Math.PI * 2 };
        offspring.data.wheels.push(newWheel);
    }
    var wheelsNeeded = maxWheels - offspring.data.wheels.length;
    if (wheelsNeeded > 0) {
        for (var j = 0; j < wheelsNeeded; j++) {
            var ind = Math.floor(Math.random() * this.bodyParts);
            offspring.data.wheels.push({ index: ind + 0, r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: Math.random() < wheelProb, axelAngle: ind / this.bodyParts * Math.PI * 2 });
        }

    }
    if (wheelsNeeded < 0) {
        for (var j = 0; j < (-wheelsNeeded); j++) {
            offspring.data.wheels.splice(Math.floor(Math.random() * offspring.data.wheels.length), 1);
        }
    }
    var activatedWheels = 0;
    for (var i = 0; i < offspring.data.wheels.length; i++) {
        if (offspring.data.wheels[i].o) {
            activatedWheels++;
        }
    }

    var wheelActivationsNeeded = offspring.data.wheels.length * wheelProb - activatedWheels;
    if (wheelActivationsNeeded > 0) {
        for (var j = 0; j < wheelActivationsNeeded; j++) {
            var wi = Math.floor(Math.random() * offspring.data.wheels.length);
            offspring.data.wheels[wi].o = (Math.random() < 0.5) || offspring.data.wheels[wi].o;
        }
    }
    if (Math.random() < explorationRate) {
        if (offspring.data.wheels.length < this.maxWheels && Math.random() < 0.5) {
            var ind = Math.floor(Math.random() * this.bodyParts);
            offspring.data.wheels.push({ index: ind, r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: Math.random() < 0.1, axelAngle: ind / this.bodyParts * Math.PI * 2 });
        } else {
            offspring.data.wheels.splice(Math.floor(Math.random() * offspring.data.wheels.length), 1);
        }
    }
    offspring.fixAngleWeights();
    return offspring;
}
Car.prototype.clone = function () {
    this.data.wheels.sort(this.compareWheels);

    var offspring = new Car();
    for (var i = 0; i < this.bodyParts; i++) {
        offspring.data.lengths[i] = this.data.lengths[i] + 0;
        offspring.data.angleWeights[i] = this.data.angleWeights[i] + 0;
    }
    offspring.data.wheels = [];
    for (var i = 0; i < this.data.wheels.length; i++) {
        var w = this.data.wheels[i];
        var newWheel = { index: w.index + 0, r: w.r + 0, o: w.o && true, axelAngle: w.axelAngle + 0 };
        offspring.data.wheels.push(newWheel);
    }
    return offspring;
}
