const
    inTrigger = op.inTrigger("Update"),
    inArr = op.inArray("Next Array"),
    inDur = op.inFloat("Duration", 1),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Matrix");

let lastTime = 0;
let startTime = 0;
let firsttime = true;
let cycle = 1;

const anim = new CABLES.Anim();
anim.createPort(op, "easing", init);
anim.loop = false;

let lastArr = null;

inDur.onChange = inArr.onChange = init;

let arr1, arr2;
let result = [];

inTrigger.onTriggered = () =>
{
    let t = CABLES.now() / 1000;
    const perc = anim.getValue(t);
    if (arr1 && arr2) ipMat(perc);
};

function copyArray(a)
{
    let b=[];
    b.length=a.length;
    for(let i=0;i<a.length;i++) b[i]=a[i];
    return b;
}

function init()
{
    if (!inArr.get()) return;
    if (inArr.get() == lastArr) return;

    if (lastArr)
        if (inArr.get() == lastArr )
            return;

    lastArr = inArr.get();
    startTime = performance.now();
    anim.clear(CABLES.now() / 1000.0);

    anim.setValue(CABLES.now() / 1000.0, cycle);

    if (cycle == 1) cycle = 0;
    else cycle = 1;

    if(result.length!=lastArr.length)result=copyArray(lastArr);

    if (cycle == 0)
    {
        arr1 = inArr.get();
        arr2 = copyArray(result);
    }
    else
    {
        arr1 = copyArray(result);
        arr2 = inArr.get();
    }

    anim.setValue(inDur.get() + CABLES.now() / 1000.0, cycle);

    firsttime = false;
}

function ip(val1, val2, perc)
{
    return ((val2 - val1) * perc + val1);
}

function ipMat(perc)
{
    if (!arr1 || !arr2 || arr1.length != arr2.length)
    {
        outArr.set(null);
        op.error("arrays wrong", arr1.length, arr2.length);
    }
    else
    {
        for (let i = 0; i < arr1.length; i++)
        {
            result[i] = ip(arr1[i], arr2[i], perc);
        }

        outArr.set(null);
        outArr.set(result);
    }
    next.trigger();
}