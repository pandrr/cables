
op.name='mousewheel';

var min=op.inValue("min",-100);
var max=op.inValue("max", 100);

var smooth=op.inValueBool("smooth");
var smoothSpeed=op.inValue("delay",0.3);
var preventScroll=op.inValueBool("prevent scroll");

var delta=op.outValue("delta",0);
var absVal=op.outValue("absolute value",0);

var cgl=op.patch.cgl;
cgl.canvas.addEventListener('wheel', onMouseWheel);

var value=0;

var anim=new CABLES.TL.Anim();
anim.defaultEasing=CABLES.TL.EASING_SIN_OUT;

var startTime=Date.now()/1000.0;
var v=0;

anim.clear();
anim.setValue(Date.now()/1000.0-startTime,absVal.get());


function updateSmooth()
{
    var v=anim.getValue( Date.now()/1000.0-startTime );
    absVal.set( v );
}

smooth.onChange=function()
{
    if(smooth.get()) smoothTimer = setInterval(updateSmooth, 15);
        else clearTimeout(smoothTimer);
};

function wheelDistance(evt)
{
    if (!evt) evt=event;
    var w=evt.wheelDelta, d=evt.detail;
    if (d)
    {
        if (w) return w/d/40*d>0?1:-1; // Opera
        else return -d/3;              // Firefox;         TODO: do not /3 for OS X
    } 
    else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
}


function onMouseWheel(e)
{
    var d=parseFloat( wheelDistance(e))*-0.05;

    delta.set(d);
    v-=d;

    if(v<min.get())v=parseFloat(min.get());
    if(v>max.get())v=parseFloat(max.get());
    
    if( !smooth.get() )
    {
        absVal.set(v);
    }
    else
    {
        anim.clear();
        anim.setValue(Date.now()/1000.0-startTime,absVal.get());
        anim.setValue(Date.now()/1000.0-startTime+smoothSpeed.get(),v);
    }
    
    if(preventScroll.get()) e.preventDefault();


}

