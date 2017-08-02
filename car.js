function Car(data){
    if(data){
        this.data=data;
    }else{
        this.data={carBody:{lengths:[50,50,50,50,50,50,50,50],angleSize:[45,45,45,45,45,45,45,45]},wheels:[]};
        for(var i=0;i<8;i++){
            this.data.wheels.push({index:i,radius:10});
        }
    }
}