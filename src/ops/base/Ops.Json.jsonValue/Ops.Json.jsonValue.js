
op.name='jsonValue';

var data=op.addInPort(new Port(op,"data",OP_PORT_TYPE_OBJECT ));
var key=op.addInPort(new Port(op,"key",OP_PORT_TYPE_VALUE,{type:'string'}));
var result=op.addOutPort(new Port(op,"result"));

result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;


data.onValueChanged=exec;

function exec()
{
    console.log('data../..',data.get());
    
    
    if(data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set( data.get()[key.get()] );
    }
    else
    {
        result.set( null);
    }
}
