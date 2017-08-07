op.name="Phyllotaxis";


var exec=op.inFunction("Render");
var inNum=op.inValue("Num",400);
var inC=op.inValue("Scale",0.1);

var next=op.outFunction("Next");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outI=op.outValue("Index");



exec.onTriggered=function()
{
    var n=inNum.get();
    var c=inC.get();
    
    for (var i = 0; i < n; i++)
    {
        var a = i * 137.5;
        var r = c * Math.sqrt(i);
        var x = r * Math.cos(a);
        var y = r * Math.sin(a);
        var hu = i
        // var hu=Math.sin( i * 0.5);
        hu = i/3.0 % 360;
        // fill(hu, 255, 255);
        // noStroke();
        // ellipse(x, y, 4, 4);
        outX.set(x);
        outY.set(y);
        outI.set(i);
        next.trigger();
    }

}