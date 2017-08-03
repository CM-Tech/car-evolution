function Car(data) {
    if (data) {
        this.data = data;
    } else {
        this.data = { lengths: [], angleWeights: [], wheels: [] };
        for (var i = 0; i < this.bodyParts; i++) {
            this.data.lengths.push(this.maxLength / 2 * (Math.random() / 4 * 3 + 0.25));
            this.data.angleWeights.push(0.5 + Math.random());
        }
        for (var i = 0; i < 1; i++) {
            this.data.wheels.push({ index: Math.floor(Math.random() * this.bodyParts), r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: true, axelAngle: i / this.bodyParts * Math.PI * 2 });
        }
        for (var i = 0; i < this.maxWheels-1; i++) {
            this.data.wheels.push({ index: Math.floor(Math.random() * this.bodyParts), r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: Math.random() < 0.1, axelAngle: i / this.bodyParts * Math.PI * 2 });
        }
    }
}
Car.prototype.bodyParts = 8;
Car.prototype.maxWheels = 8; 
Car.prototype.maxLength = 100;
Car.prototype.maxRadius = 20;
Car.prototype.minRadius = 5;
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
Car.prototype.breed = function (other) {
    var mutationRate=0.05;
    var explorationRate=0.075;
    this.data.wheels.sort(this.compareWheels);
    other.data.wheels.sort(this.compareWheels);
    var offspring = new Car();
    for(var i=0;i<this.bodyParts;i++){
        if(Math.random()>explorationRate){
            var lerp=(Math.random()-0.5)/10+0.5;
            offspring.data.lengths[i]=Math.min(Math.max((this.data.lengths[i]*lerp+other.data.lengths[i]*(1-lerp))*(1-mutationRate)+mutationRate*Math.random()*this.maxLength,0),this.maxLength);
        }
    }
    offspring.data.wheels=[];
    for(var i=0;i<Math.max(this.data.wheels.length,other.data.wheels.length);i++){
        var aHaveWheel=i<this.data.wheels.length;
        var bHaveWheel=i<other.data.wheels.length;
        var a=aHaveWheel?this.data.wheels[i]:other.data.wheels[i];
        var b=aHaveWheel&&bHaveWheel?other.data.wheels[i]:null;
        if(aHaveWheel){

        }else{
            
        }
        
    }
    return offspring;
}
