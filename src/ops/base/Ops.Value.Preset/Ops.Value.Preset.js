const
    dataPort=op.inString("data",""),
    setsPort=op.inString("sets",""),
    id=op.inString("presetid",CABLES.shortId()),

    inInterPolate=op.inSwitch("Interpolation",["None","xfade","a-b"],"None"), //"a..b","a..c"

    presetA=op.inFloat("Preset A","0"),
    presetB=op.inFloat("Preset B","1"),
    presetFade=op.inFloatSlider("Fade",0.0),

    presetNames=op.inDropDown("Preset",[]),
    presetCreate=op.inTriggerButton("Create new"),
    presetUpdate=op.inTriggerButton("Update"),
    presetDelete=op.inTriggerButton("Delete"),
    addPort=op.addOutPort(new CABLES.Port(op,"Create Variable",CABLES.OP_PORT_TYPE_DYNAMIC)),
    outNum=op.outNumber("Num Presets",0);

var data=[];
var presets=[];
var valuePorts=[];
var interpolate=0;

op.setPortGroup("Manage Presets",[presetCreate,presetUpdate,presetDelete,presetNames]);
dataPort.setUiAttribs({"hideParam":true,"hidePort":true});
id.setUiAttribs({"hideParam":true,"hidePort":true});
setsPort.setUiAttribs({"hideParam":true,"hidePort":true});
presetCreate.setUiAttribs({"hidePort":true});
presetUpdate.setUiAttribs({"hidePort":true});
presetDelete.setUiAttribs({"hidePort":true});
presetNames.setUiAttribs({"showIndex":true});

presetNames.onChange=updatePreset;
inInterPolate.onChange=updateInterpolation;
presetA.onChange=
    presetB.onChange=
    presetFade.onChange=updateFade;

updateInterpolation();
updateDropdown();

function updateInterpolation()
{
    var ip=inInterPolate.get();
    if(ip==="None")
    {
        interpolate=0;
        presetA.setUiAttribs({"greyout":true});
        presetB.setUiAttribs({"greyout":true});
        presetFade.setUiAttribs({"greyout":true});
    }
    else if(ip==="xfade")
    {
        interpolate=1;
        presetA.setUiAttribs({"greyout":false});
        presetB.setUiAttribs({"greyout":false});
        presetFade.setUiAttribs({"greyout":false});
    }
    else if(ip==="a-b")
    {
        interpolate=2;
        presetA.setUiAttribs({"greyout":false});
        presetB.setUiAttribs({"greyout":true});
        presetFade.setUiAttribs({"greyout":true});
    }

    op.setUiAttrib({"extendTitle":ip});

    if(interpolate!==0) updateFade();
    else updatePreset();
}



function updateFade()
{
    if(interpolate===0) return;

    var fade=0;
    var idxa=0;
    var idxb=0;

    if(interpolate===2) // a-b
    {
        var pr=presetA.get();
        idxa=Math.floor(pr);
        idxb=Math.ceil(pr);
        fade=pr%1;
    }
    else if(interpolate===1) // xfade
    {
        fade=presetFade.get();
        idxa=Math.floor(presetA.get());
        idxb=Math.floor(presetB.get());
    }

    {
        var a=presets[idxa];
        var b=presets[idxb];

        if(!a || !b)
        {
            console.warn("preset not found");
            return;
        }

        // todo: cache variable, so no string lookup needed every time...

        for(var i in a.values)
        {
            var ip=a.values[i]+ (b.values[i]-a.values[i])*fade;
            op.patch.setVarValue(i,ip);
        }

    }
}


function savePresets()
{
    setsPort.set(JSON.stringify(presets));
    outNum.set(presets.length);
}

function setPresetValues(preset)
{
    preset.values=preset.values || {};

    for(var i=0;i<valuePorts.length;i++)
        preset.values[valuePorts[i].name]=valuePorts[i].value;

    return preset;
}

function updateDropdown()
{
    presetNames.uiAttribs.values.length=0;
    for(var i=0;i<presets.length;i++)
        presetNames.uiAttribs.values.push(presets[i].name);
}

function getPreset(name)
{
    for(var i=0;i<presets.length;i++)
        if(presets[i] && presets[i].name==name)
            return presets[i];
}

setsPort.onChange=function()
{
    presets=JSON.parse(setsPort.get());
    outNum.set(presets.length);
    updateDropdown();
    setsPort.onChange=null;
};

function updatePreset()
{
    var preset=getPreset(presetNames.get());

    if(!preset)return;

    var varnames=Object.keys(preset.values);

    for (var i = 0; i < varnames.length; i++)
    {
        var p=op.getPort(varnames[i]);
        if(p)
        {
            p.set(preset.values[varnames[i]]);
            if(interpolate===0)p.forceChange();
        }
    }

    op.refreshParams();

    if(interpolate!==0) updateFade();
}

presetUpdate.onTriggered=function()
{
    var preset=getPreset(presetNames.get());
    preset=setPresetValues(preset);
    savePresets();
};

presetCreate.onTriggered=function()
{
    if(!CABLES.UI)return;
    CABLES.UI.MODAL.prompt("New Preset","Enter a new preset name","",
        function(str)
        {
            op.refreshParams();
            presetNames.set(str);
            var preset={"name":str};
            preset=setPresetValues(preset);
            presets.push(preset);
            updateDropdown();
            savePresets();
        });
};

presetDelete.onTriggered=function()
{
    if(!CABLES.UI)return;
    const current=presetNames.get();
    const idx=presetNames.uiAttribs.values.indexOf(current);
    presetNames.uiAttribs.values.splice(idx,1);
    op.refreshParams();
};

dataPort.onChange=function()
{
    data=JSON.parse(dataPort.get());

    for(var i=0;i<data.length;i++)
    {
        var portObject=data[i];

        const varname=portObject.varname;

        if(!op.getPort(varname))
        {
        	if(portObject.type==CABLES.OP_PORT_TYPE_VALUE)
        	{
        	   // op.patch.setVarValue(varname,0);

                var val=op.patch.getVarValue(varname);
        	    var port=op.inFloat(varname,val);

        	    port.setUiAttribs({
        	        "editableTitle":true,
        	        "title":portObject.title});

        	    listenPortChange(port,varname);

        	    port.set(val);
        	    port.forceChange();
        	}
        }
    }

    // dataPort.onChange=null;
};


function saveData()
{
    dataPort.set(JSON.stringify(data));
}

function listenPortChange(port,varname)
{
    valuePorts.push(port);
    port.onChange=function()
    {
        op.patch.setVarValue(varname,port.get());
    };
}

op.patch.addEventListener("onOpDelete",(optodelete)=>
{
    if(optodelete.objName.indexOf("VarGet")==-1)return;

    var newData=[];
    for(var i=0;i<data.length;i++)
    {
        var found=false;

        for(var oi=0;oi<op.patch.ops.length;oi++)
        {
            const opt=op.patch.ops[oi];

            if(
                opt!=optodelete &&
                opt.objName.indexOf("VarGet">-1) &&
                opt.varName &&
                opt.varName.get &&
                opt.varName.get()==data[i].varname)
            {
                found=true;
                break;
            }
        }

        if(found)
        {
            console.log('found!')
            newData.push(data[i]);
        }
        else
        {
            op.removePort(op.getPort(data[i].varname));
        }
    }

    data=newData;
    saveData();
    op.refreshParams();
    setTimeout(op.refreshParams.bind(this),1000);
});


addPort.onLinkChanged=function()
{
    if(addPort.links.length===0)
    {
        op.log("no links!");
        return;
    }

    var link=addPort.links[0];
    var otherPort=link.getOtherPort(addPort);



    const varname=".preset_"+otherPort.name+"_"+id.get()+'_'+CABLES.shortId();

//     var newPort=op.addInPort(new CABLES.Port(op,varname,otherPort.type));

// op.log("pilength",op.portsIn);

//     newPort.setUiAttribs({"editableTitle":true,"title":newPort.name});
//     newPort.set(otherPort.get());

    op.log("pilength",op.portsIn.length);

    data.push(
        {
            "varname":varname,
            "title":otherPort.parent.name+" "+otherPort.name,
            "type":otherPort.type
        });

        console.log("otherPort.get()",otherPort.get());

    const oldValue=otherPort.get()

    op.patch.setVarValue(varname,oldValue);

// 	if(newPort.type==CABLES.OP_PORT_TYPE_VALUE)
// 	{
        // var opGetter = op.patch.addOp("Ops.Vars.VarGetNumber");
        // opGetter.varName.set(varname);


//     }

    // listenPortChange(newPort,varname);

    addPort.removeLinks();
    if(CABLES.UI && gui) gui.patch().removeDeadLinks();
    saveData();
    op.refreshParams();

    // var newPort=op.getPort("varname")

    // op.patch.link(otherPort.parent,otherPort.name,opGetter,"Value");

    otherPort.setVariable(varname);

};



