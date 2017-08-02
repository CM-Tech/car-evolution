function Car(data){
    if(data){
        this.data=data;
    }else{
        this.data={carBody:{lengths:[],angleWeight:[]},wheels:[]};
        for(var i=0;i<this.bodyParts;i++){
            this.data.carBody.lengths.push(this.maxLength/2);
            this.data.carBody.angleWeight.push(0.5);
            this.data.wheels.push({index:i,radius:this.maxRadius/2});
        }
        
    }
}
Car.prototype.bodyParts=12;
Car.prototype.maxLength=100;
Car.prototype.maxRadius=50;
Car.prototype.breed=function(other){
    
}