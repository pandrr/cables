const
    inArr=op.inArray("Array"),
    inPad=op.inFloat("Padding",0),
    outArr=op.outArray("Result");

const newArr=[];

inPad.onChange=
inArr.onChange=()=>
{
    outArr.set(null);
    let arr=inArr.get();
    if(!arr || arr.length<1)return;

    newArr.length=arr.length;

    newArr[0]=arr[0];

    for(let i=1;i<arr.length;i++)
    {
        newArr[i]=newArr[i-1]+arr[i]+inPad.get();
    }

    outArr.set(newArr);


};