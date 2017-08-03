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
    for(var i=0;i<Math.min(Math.max(this.data.wheels.length,other.data.wheels.length),this.maxWheels);i++){
        var aHaveWheel=i<this.data.wheels.length;
        var bHaveWheel=i<other.data.wheels.length;
        var a=aHaveWheel?this.data.wheels[i]:other.data.wheels[i];
        var b=aHaveWheel&&bHaveWheel?other.data.wheels[i]:a;
        //if(a&&b){
            var lerp=(Math.random()-0.5)/10+0.5;
            var aR=a.r;
            if(!a.o){
                aR=0;
            }
            var bR=b.r;
            if(!b.o){
                bR=0;
            }
            var newR=Math.min(Math.max((a.r*lerp+b.r*(1-lerp))*(1-mutationRate)+mutationRate*(Math.random()*1.1-0.1)*this.maxRadius,this.minRadius),this.maxRadius);
            var lerp=(Math.random()-0.5)/10+0.5;
            var newO=((a.o?1:0)*lerp+(b.o?1:0)*(1-lerp))*(1-mutationRate)+mutationRate*(Math.random())>0.5;
            //var newI=((a.index)*lerp+(b.index)*(1-lerp))*(1-mutationRate)+mutationRate*(Math.random())>0.5;
            var dirIndexA={x:Math.cos(a.index*Math.PI*2/this.bodyParts),y:Math.sin(a.index*Math.PI*2/this.bodyParts)};
            var dirIndexB={x:Math.cos(b.index*Math.PI*2/this.bodyParts),y:Math.sin(b.index*Math.PI*2/this.bodyParts)};
            var lerp=(Math.random()-0.5)/10+0.5;
            var dirIndex={x:dirIndexA.x*lerp+dirIndexB.x*(1-lerp),y:dirIndexA.y*lerp+dirIndexB.y*(1-lerp)};
            var newIndex=Math.floor(Math.atan2(dirIndex.y,dirIndex.x)/Math.PI/2*this.bodyParts);
            var newRandIndex=Math.floor(Math.random()*this.bodyParts);
            var dirIndexA={x:Math.cos(newRandIndex*Math.PI*2/this.bodyParts),y:Math.sin(newRandIndex*Math.PI*2/this.bodyParts)};
            var dirIndexB={x:Math.cos(newIndex*Math.PI*2/this.bodyParts),y:Math.sin(newIndex*Math.PI*2/this.bodyParts)};
            lerp=mutationRate;
            dirIndex={x:dirIndexA.x*lerp+dirIndexB.x*(1-lerp),y:dirIndexA.y*lerp+dirIndexB.y*(1-lerp)};
            newIndex=Math.floor(Math.atan2(dirIndex.y,dirIndex.x)/Math.PI/2*this.bodyParts);
            if(Math.random()>explorationRate){
                newIndex=Math.floor(Math.random()*this.bodyParts);
            }
            if(newR<=this.minRadius){
                newO=false;
            }
            if(Math.random()>explorationRate){
                newO=Math.random()>0.1;
                newR=(this.maxRadius - this.minRadius) * Math.random() + this.minRadius;
            }
            var newWheel={ index: newIndex, r: newR,o:newO, axelAngle: newIndex / this.bodyParts * Math.PI * 2 };
        offspring.data.wheels.push(newWheel);

       /* }else{
            var newR=Math.min(Math.max((a.r*lerp+b.r*(1-lerp))*(1-mutationRate)+mutationRate*Math.random()*this.maxRadius,0),this.maxRadius);
            var newWheel={ index: Math.floor(Math.random() * this.bodyParts), r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: Math.random() < 0.1, axelAngle: i / this.bodyParts * Math.PI * 2 };
        offspring.data.wheels.push(newWheel);
        }*/
        
    }
    if(Math.random()>explorationRate) {
        if(offspring.data.wheels.length<this.maxWheels && Math.random()<0.5){
        var i=Math.floor(Math.random() * this.bodyParts);
            offspring.data.wheels.push({ index: i, r: (this.maxRadius - this.minRadius) * Math.random() + this.minRadius, o: Math.random() < 0.1, axelAngle: i / this.bodyParts * Math.PI * 2 });
    
        }else{
            offspring.data.wheels.splice(Math.floor(Math.random()*offspring.data.wheels.length),1);
        }
    }
    return offspring;
}
