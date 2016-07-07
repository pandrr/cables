op.name="Incrementor";


var max=this.addInPort(new Port(this,"Maximum",OP_PORT_TYPE_VALUE));
var increment=this.addInPort(new Port(this,"Increment",OP_PORT_TYPE_FUNCTION));

var value=this.addOutPort(new Port(this,"Value",OP_PORT_TYPE_VALUE));

max.set(10);
var val=0;

increment.onTriggered=function()
{
    val++;
    if(val>max.get())val=0;
    value.set(val);
};