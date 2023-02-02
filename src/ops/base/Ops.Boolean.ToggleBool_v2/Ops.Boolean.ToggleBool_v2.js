const
    trigger = op.inTriggerButton("trigger"),
    reset = op.inTriggerButton("reset"),
    inDefault = op.inBool("Default", false),
    outBool = op.outBoolNum("result");

let theBool = false;

op.onLoadedValueSet = () =>
{
    outBool.set(inDefault.get());
};

trigger.onTriggered = function ()
{
    theBool = !theBool;
    outBool.set(theBool);
};

reset.onTriggered = function ()
{
    theBool = inDefault.get();
    outBool.set(theBool);
};