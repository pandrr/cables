let visible = op.inValueBool("visible", true);
let inFocus = op.inTriggerButton("focus");
let inBlur = op.inTriggerButton("blur");

let text = op.outString("text", "");
let cursorPos = op.outNumber("cursorPos");
let focussed = op.outBoolNum("focussed");
let escapeButton = op.outTrigger("escape pressed");
let outEle = op.outObject("Element");

let element = document.createElement("textarea");
element.id = "thetextarea";
element.style.position = "absolute";
element.style.top = "0px";
element.style.width = "300px";
element.style.opacity = 0.75;
element.style.height = "100px";
element.style.overflow = "hidden";
element.style.border = "none";
element.style.padding = 0;
element.style["z-index"] = "999999";

outEle.set(element);

let canvas = document.body;
canvas.appendChild(element);

element.addEventListener("input", update);
element.onkeydown = update;
update();

visible.onChange = function ()
{
    if (!visible.get())
    {
        element.style.width = "0px";
        element.style.height = "0px";
    }
    else
    {
        element.style.width = "300px";
        element.style.height = "100px";
    }
};

element.onfocus = function ()
{
    element.focus();
    focussed.set(true);
};

element.onblur = function ()
{
    focussed.set(false);
    canvas.focus();
};

element.onkeyup = function (e)
{
    if (e.keyCode == 27)
    {
        focussed.set(false);
        escapeButton.trigger();
    }
};

op.onDelete = function ()
{
    element.remove();
};

inFocus.onTriggered = function ()
{
    element.focus();
};

inBlur.onTriggered = function ()
{
    element.blur();
};

function update()
{
    text.set(element.value || "");
    cursorPos.set(element.selectionStart);
}