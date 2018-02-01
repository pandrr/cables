

var inId=op.inValueString("Id");
var inClass=op.inValueString("Class");
var inText=op.inValueString("Text");
var inStyle=op.inValueEditor("Style","position:absolute;","css");

var inInteractive=op.inValueBool("Interactive",false);
var inVisible=op.inValueBool("Visible",true);

var outHover=op.outValue("Hover");
var outClicked=op.outFunction("Clicked");

var div=null;
var listenerElement=null;

div = document.createElement('div');
var canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(div);

inClass.onChange=updateClass;
inText.onChange=updateText;
inStyle.onChange=updateStyle;
inInteractive.onChange=updateInteractive;
inVisible.onChange=updateVisibility;

function updateVisibility()
{
    if(!inVisible.get()) div.style.visibility='hidden';
        else div.style.visibility='visible';
}

function updateText()
{
    div.innerHTML=inText.get();
}

op.onDelete=function()
{
    div.remove();
};

function updateStyle()
{
    div.setAttribute("style",inStyle.get());
}

function updateClass()
{
    div.setAttribute("class",inClass.get());
}

function onMouseEnter()
{
    outHover.set(true);
}

function onMouseLeave()
{
    outHover.set(false);
}

function onMouseClick()
{
    outClicked.trigger();
}

function updateInteractive()
{
    removeListeners();
    if(inInteractive.get()) addListeners();
}

function removeListeners()
{
    if(listenerElement)
    {
        listenerElement.removeEventListener('click', onMouseClick);
        listenerElement.removeEventListener('mouseleave', onMouseLeave);
        listenerElement.removeEventListener('mouseenter', onMouseEnter);
        listenerElement=null;
    }
}

function addListeners()
{
    if(listenerElement)removeListeners();
    
    listenerElement=div;

    if(listenerElement)
    {
        listenerElement.addEventListener('click', onMouseClick);
        listenerElement.addEventListener('mouseleave', onMouseLeave);
        listenerElement.addEventListener('mouseenter', onMouseEnter);
    }
}
