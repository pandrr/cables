const
    inExec = op.inTrigger("Render"),
    inStr = op.inString("Search", ""),
    inSort = op.inSwitch("Order", ["None", "AlphaNumerical"], "None"),
    inSpace = op.inSwitch("Space", ["GLTF", "World"], "GLTF"),
    outPos = op.outArray("Positions"),
    next = op.outTrigger("Next"),
    outScale = op.outArray("Scale"),
    outNames = op.outArray("Names"),
    outRot = op.outArray("Rotation");

const cgl = op.patch.cgl;
let needsupdate = true;
outPos.onChange = function () { needsupdate = true; };
inExec.onTriggered = exec;

inStr.onChange = function ()
{
    needsupdate = true;
};
function exec()
{
    // if (needsupdate)
    update();
    next.trigger();
}

function update()
{
    outPos.set(null);
    outScale.set(null);
    outNames.set(null);
    // outRot.set(null);

    if (!cgl.frameStore.currentScene) return;

    const arrPos = [];
    const arrRot = [];
    const arrScale = [];
    const arrNames = [];

    const worldspace = inSpace.get() == "World";

    for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
    {
        if (cgl.frameStore.currentScene.nodes[i].name.indexOf(inStr.get()) == 0)
        {
            const n = cgl.frameStore.currentScene.nodes[i]._node;
            const node = cgl.frameStore.currentScene.nodes[i];
            arrNames.push(n.name);

            const tr = vec3.create();

            const m = node.modelMatAbs();
            // const m=node.modelMatLocal();
            // console.log(node.modelMatLocal())

            if (worldspace)
            {
                // mat4.sub(m,cgl.mMatrix,m);
                // mat4.mul(m,m,cgl.mMatrix);
            }

            mat4.getTranslation(tr, m);

            // const empty=vec3.create();
            // vec3.transformMat4(tr, empty, m);

            arrPos.push(tr[0], tr[1], tr[2]);

            const q = quat.create();
            mat4.getRotation(q, m);
            arrRot.push(q[0], q[1], q[2], q[3]);

            if (node._tempAnimScale) arrScale.push(node._tempAnimScale[0], node._tempAnimScale[1], node._tempAnimScale[2]);
            else if (n.scale) arrScale.push(n.scale[0], n.scale[1], n.scale[2]);
            else arrScale.push(1, 1, 1);
        }
    }

    if (inSort.get())
    {
        let list = [];
        for (let j = 0; j < arrNames.length; j++)
            list.push({
                "name": arrNames[j],
                "pos": [arrPos[j * 3 + 0], arrPos[j * 3 + 1], arrPos[j * 3 + 2]],
                "scale": [arrScale[j * 3 + 0], arrScale[j * 3 + 1], arrScale[j * 3 + 2]]
            });

        list.sort(function (a, b)
        {
            return ((a.name < b.name) ? -1 : ((a.name == b.name) ? 0 : 1));
            // Sort could be modified to, for example, sort on the age
            // if the name is the same.
        });

        // 3) separate them back out:
        for (let k = 0; k < list.length; k++)
        {
            arrNames[k] = list[k].name;
            arrPos[k * 3 + 0] = list[k].pos[0];
            arrPos[k * 3 + 1] = list[k].pos[1];
            arrPos[k * 3 + 2] = list[k].pos[2];
            arrScale[k * 3 + 0] = list[k].scale[0];
            arrScale[k * 3 + 1] = list[k].scale[1];
            arrScale[k * 3 + 2] = list[k].scale[2];
        }
    }

    outPos.set(arrPos);
    outScale.set(arrScale);
    outNames.set(arrNames);
    outRot.set(arrRot);

    needsupdate = false;
}
