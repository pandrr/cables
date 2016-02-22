this.name="orbital controls";
var cgl=this.patch.cgl;
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));


var minDist=this.addInPort(new Port(this,"min distance",OP_PORT_TYPE_VALUE));
minDist.set(0.05);

var eye=vec3.create();
var vUp=vec3.create();
var vCenter=vec3.create();
var transMatrix=mat4.create();
var vOffset=vec3.create();

var mouseDown=false;
var radius=5;
var lastMouseX=0,lastMouseY=0;
var percX=0,percY=0;


vec3.set(vCenter, 0,0,0);
vec3.set(vUp, 0,1,0);

var tempEye=vec3.create();
var tempCenter=vec3.create();

render.onTriggered=function()
{
    cgl.pushMvMatrix();

vec3.add(tempEye, eye, vOffset);
vec3.add(tempCenter, vCenter, vOffset);

    mat4.lookAt(transMatrix, tempEye, tempCenter, vUp);
    mat4.rotate(transMatrix, transMatrix, percX, vUp);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

    trigger.trigger();
    cgl.popMvMatrix();
};


function circlePos(perc)
{
    if(radius<minDist.get())radius=minDist.get();
    var i=0,degInRad=0;
    var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius,
        Math.sin(degInRad)*radius,
        0);
    return vec;
}

var onmousemove = function(e)
{
    if(!mouseDown) return;

    var x = event.clientX;
    var y = event.clientY;
    
    if(e.which==3)
    {
        vOffset[2]+=(x-lastMouseX)*0.025;
        vOffset[1]+=(y-lastMouseY)*0.025;
        eye=circlePos(percY);
    }
    else
    if(e.which==2)
    {
        radius+=(y-lastMouseY)*0.06;

        eye=circlePos(percY);
    }
    else
    {
        percX+=(x-lastMouseX)*0.0025;
        percY+=(y-lastMouseY)*0.0025;
        if(percY>0.5)percY=0.5;
        if(percY<-0.5)percY=-0.5;
        eye=circlePos(percY);
    }

    lastMouseX=x;
    lastMouseY=y;
    

};

function onMouseDown(e)
{
    cgl.canvas.style.cursor='none';
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown=true;
}

function onMouseUp()
{
    mouseDown=false;
    cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

function onMouseEnter(e)
{
    cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

var onMouseWheel=function(e)
{
    var wheelDistance = function(evt)
    {
      if (!evt) evt = event;
      var w=evt.wheelDelta, d=evt.detail;
      if (d){
        if (w) return w/d/40*d>0?1:-1; // Opera
        else return -d/3;              // Firefox;         TODO: do not /3 for OS X
      } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    };

    var delta=parseFloat( wheelDistance(e))*-0.05;
    radius+=(parseFloat(delta))*1.2;

    eye=circlePos(percY);
    e.preventDefault();
};


cgl.canvas.addEventListener('mousemove', onmousemove);
cgl.canvas.addEventListener('mousedown', onMouseDown);
cgl.canvas.addEventListener('mouseup', onMouseUp);
cgl.canvas.addEventListener('mouseleave', onMouseUp);
cgl.canvas.addEventListener('mouseenter', onMouseEnter);
cgl.canvas.addEventListener('contextmenu', function(e){e.preventDefault();});
cgl.canvas.addEventListener('wheel', onMouseWheel);

this.onDelete=function()
{
    console.log("remove arcball op...");
    cgl.canvas.removeEventListener('mousemove', onmousemove);
    cgl.canvas.removeEventListener('mousedown', onMouseDown);
    cgl.canvas.removeEventListener('mouseup', onMouseUp);
    cgl.canvas.removeEventListener('mouseleave', onMouseUp);
    cgl.canvas.removeEventListener('mouseenter', onMouseUp);
    cgl.canvas.removeEventListener('wheel', onMouseWheel);
};

eye=circlePos(0);



