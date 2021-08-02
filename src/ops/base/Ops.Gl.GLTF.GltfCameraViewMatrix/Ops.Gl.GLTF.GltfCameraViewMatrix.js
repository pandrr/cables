const
    inExec = op.inTrigger("Update"),
    inName = op.inString("Node Name", "default"),
    outArr = op.outArray("Matrix"),
    outFound = op.outBool("Found");

let camNode = null;

inExec.onTriggered = () =>
{
    if (!camNode) findCam();

    if (camNode)
    {
        camNode.start(0);
        camNode.end();
        outArr.set(camNode.vMat);
    }
};

inName.onChange = findCam;

function findCam()
{
    const gltf = op.patch.cgl.frameStore.currentScene;

    if (gltf)
    {
        gltf.cameras = gltf.cameras || [];
        for (let i = 0; i < gltf.cameras.length; i++)
        {
            if (gltf.cameras[i].name == inName.get())
            {
                camNode = gltf.cameras[i];
                outFound.set(true);
                return;
            }
        }
    }

    outFound.set(false);
}