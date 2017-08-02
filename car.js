function car(data){
    if(data){
        this.data=data;
    }else{
        this.data={carBody:[50,50,50,50,50,50,50,50],wheels:[{index:1,radius:10}]};
    }
}