var cgl=op.patch.cgl;

var render=op.inTrigger('render');
var useVPSize=op.addInPort(new CABLES.Port(op,"use viewport size",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

var width=op.inValueInt("texture width");
var height=op.inValueInt("texture height");
var tfilter=op.addInPort(new CABLES.Port(op,"filter",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var msaa=op.inValueSelect("MSAA",["none","2x","4x","8x"],"none");
var trigger=op.outTrigger('trigger');
// var tex=op.addOutPort(new CABLES.Port(op,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
// var texDepth=op.addOutPort(new CABLES.Port(op,"textureDepth",CABLES.OP_PORT_TYPE_TEXTURE));

var tex=op.outTexture("texture");
var texDepth=op.outTexture("textureDepth");

var fpTexture=op.inValueBool("HDR");
var depth=op.inValueBool("Depth",true);
var clear=op.inValueBool("Clear",true);

var fb=null;

width.set(512);
height.set(512);
useVPSize.set(true);
tfilter.set('linear');
var reInitFb=true;

op.setPortGroup('Alignment',[useVPSize,width,height,tfilter]);


// todo why does it only work when we render a mesh before>?>?????
// only happens with matcap material with normal map....

useVPSize.onChange=updateVpSize;
function updateVpSize()
{
    if(useVPSize.get())
    {
        width.setUiAttribs({greyout:true});
        height.setUiAttribs({greyout:true});
    }
    else
    {
        width.setUiAttribs({greyout:false});
        height.setUiAttribs({greyout:false});
    }
}

fpTexture.onChange=function()
{
    reInitFb=true;
};

depth.onChange=function()
{
    reInitFb=true;
};

clear.onChange=function()
{
    reInitFb=true;
};

var onFilterChange=function()
{
    reInitFb=true;
};

msaa.onChange=function()
{
    reInitFb=true;
};

function doRender()
{
    if(!fb || reInitFb)
    {
        if(fb) fb.delete();
        if(cgl.glVersion>=2)
        {
            var ms=true;
            var msSamples=4;

            if(msaa.get()=="none")
            {
                msSamples=0;
                ms=false;
            }
            if(msaa.get()=="2x")msSamples=2;
            if(msaa.get()=="4x")msSamples=4;
            if(msaa.get()=="8x")msSamples=8;

            fb=new CGL.Framebuffer2(cgl,8,8,
            {
                isFloatingPointTexture:fpTexture.get(),
                multisampling:ms,
                depth:depth.get(),
                multisamplingSamples:msSamples,
                clear:clear.get()
            });
        }
        else
        {
            fb=new CGL.Framebuffer(cgl,8,8,{isFloatingPointTexture:fpTexture.get()});
        }

        if(tfilter.get()=='nearest') fb.setFilter(CGL.Texture.FILTER_NEAREST);
            else if(tfilter.get()=='linear') fb.setFilter(CGL.Texture.FILTER_LINEAR);
            else if(tfilter.get()=='mipmap') fb.setFilter(CGL.Texture.FILTER_MIPMAP);


        texDepth.set( fb.getTextureDepth() );
        reInitFb=false;
    }

    if(useVPSize.val)
    {
        width.set( cgl.getViewPort()[2] );
        height.set( cgl.getViewPort()[3] );
    }

    if(fb.getWidth()!=Math.ceil(width.get()) || fb.getHeight()!=Math.ceil(height.get()) )
    {
        fb.setSize(
            Math.max(1,Math.ceil(width.get())),
            Math.max(1,Math.ceil(height.get())) );
    }

    fb.renderStart(cgl);

    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.resetViewPort();

    tex.set( fb.getTextureColor() );
}


render.onTriggered=doRender;


tfilter.onValueChange(onFilterChange);
updateVpSize();