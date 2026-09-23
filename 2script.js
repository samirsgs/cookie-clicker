class drink {
    liter;
    name;
    constructor(starliter, startname) {
        this.name = startname;
        this.liter = starliter;
    }
    literdrink(amount){
        this.liter -= amount;
    }
}