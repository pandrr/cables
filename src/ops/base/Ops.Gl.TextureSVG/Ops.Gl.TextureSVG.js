op.name='SVG Texture';

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var texWidth=op.addInPort(new Port(op,"texture width"));
var texHeight=op.addInPort(new Port(op,"texture height"));
var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE));

texWidth.set(1024);
texHeight.set(1024);

var cgl=op.patch.cgl;
var canvas=null;
var ctx=null;

function removeCanvas()
{
    if(!canvas)return;
    canvas.remove();
    canvas=null;
}

function createCanvas()
{
    if(canvas)removeCanvas();
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    textureOut.get().setSize(texWidth.get(),texHeight.get());
    ctx.canvas.width=canvas.width=texWidth.get();
    ctx.canvas.height=canvas.height=texHeight.get();

    canvas.style.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
}


textureOut.set(new CGL.Texture(cgl));


function reSize()
{


    update();
}

var data = "data:image/svg+xml," +
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
            //  '<em>I</em> like ' + 
            //  '<span style="color:white; text-shadow:0 0 2px blue;">' +
            //  'cables</span>' +
           '</div>' +
           '</foreignObject>' +
           '</svg>';



    

    

function reload()
{
    var loadingId=op.patch.loading.start('svg file',filename.get());
    CABLES.ajax(
        op.patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            data="data:image/svg+xml,"+_data;
            op.patch.loading.finished(loadingId);
            update();
        }
    );
}

function update()
{
    
    
    var img = new Image();
    var loadingId=op.patch.loading.start('svg2texture',filename.get());

    img.onerror = function()
    {
        op.patch.loading.finished(loadingId);
        op.uiAttr( { 'error': 'Could not load SVG file!' } );
    };
    
    img.onload = function()
    {
        createCanvas();
        op.patch.loading.finished(loadingId);
        canvas.width=texWidth.get();
        canvas.height=texHeight.get();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height );
        textureOut.set(new CGL.Texture.fromImage(cgl,canvas,CGL.Texture.FILTER_MIPMAP));
        removeCanvas();
    };

    img.src = data;
    
}

op.onFileUploaded=function(fn)
{
    if(filename.get() && filename.get().endsWith(fn))
    {
        reload();
    }
};

filename.onValueChange(reload);

texWidth.onValueChanged=reSize;
texHeight.onValueChanged=reSize;

createCanvas();
reSize();
