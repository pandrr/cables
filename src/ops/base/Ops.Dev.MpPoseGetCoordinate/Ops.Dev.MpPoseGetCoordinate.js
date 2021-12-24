
const marks=["Nose","Left eye inner","Left eye","Left eye outer","Right eye inner","Right eye","Right eye outer","Left ear","Right ear","Mouth left","Mouth right","Left shoulder","Right shoulder","Left elbow","Right elbow","Left wrist","Right wrist","Left pinky #1 knuckle","Right pinky #1 knuckle","Left index #1 knuckle","Right index #1 knuckle","Left thumb #2 knuckle","Right thumb #2 knuckle","Left hip","Right hip","Left knee","Right knee","Left ankle","Right ankle","Left heel","Right heel","Left foot index","Right foot index"];

const inArr=op.inArray("Landmarks");
const inWhich=op.inDropDown("Landmark",marks,"Nose");
const outX=op.outNumber("X");
const outY=op.outNumber("Y");
const outZ=op.outNumber("Z");

let index=0;

inWhich.onChange=()=>
{
    index=marks.indexOf(inWhich.get());
}
inArr.onChange=()=>
{
    const arr=inArr.get();

    if(arr)
    {
        // console.log(arr[index])
        outX.set((arr[index].x-0.5)*4.0);
        outY.set((arr[index].y-0.5)*-4.0);
        outZ.set(arr[index].z);
    }
}
