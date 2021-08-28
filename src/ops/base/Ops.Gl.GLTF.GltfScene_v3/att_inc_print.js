var tab=null;

function closeTab()
{
    if(tab)gui.mainTabs.closeTab(tab.id);
}

function printNode(html,node,level)
{
    if(!gltf)return;

    html+='<tr class="row">';
    var i=0;
    var ident="";

    for(i=0;i<level;i++)
    {
        // var last=level-1==i;
        // var identClass=last?"identnormal":"identlast";

        var identClass="identBg";
        if(i==0)identClass="identBgLevel0";
        // if(i==level-1)identClass="identBgLast";
        ident+='<td class="ident  '+identClass+'" ><div style=""></div></td>';
    }
    var id=CABLES.uuid();
    html+=ident;
    html+='<td colspan="'+(20-level)+'">';

    if(node.mesh && node.mesh.meshes.length)html+='<span class="icon icon-cube"></span>&nbsp;';
    else html+='<span class="icon icon-circle"></span> &nbsp;';

    html+=node.name;
    html+='</td>';
    html+='<td>';
    html+='</td>';

    // html+='<td>';

    if(node.mesh)
    {
        html+='<td>';
        for(i=0;i<node.mesh.meshes.length;i++)
        {
            html+=node.mesh.meshes[i].name;
            // html+=' ('+node.mesh.meshes[i].geom.vertices.length/3+' verts) ';
        }
        html+='</td>';

        html+='<td><!-- skin -->';
        html+=node.hasSkin()||"-";
        html+='</td>';

        html+='<td><!-- material> -->';
        let countMats=0;
        for(i=0;i<node.mesh.meshes.length;i++)
        {
            if(node.mesh.meshes[i].material)
            {
                html+=gltf.json.materials[node.mesh.meshes[i].material].name;
                countMats++;
            }
        }
        if(countMats==0)html+="none";
        html+='</td>';

    }
    else
    {
        html+='<td>-</td><td>-</td><td>-</td>';
    }


    html+='<td><!-- anim -->';
    if(node._animRot || node._animScale || node._animTrans)
    {
        if(node._animRot) html+='Rot ';
        if(node._animScale) html+='Scale ';
        if(node._animTrans) html+='Trans ';
    }
    else html+='None';
    html+='</td>';

    html+='<td>';
    var hideclass='';
    if(node.hidden)hideclass='node-hidden';

    html+='Expose: ';
    html+='<a onclick="gui.corePatch().getOpById(\''+op.id+'\').exposeNode(\''+node.name+'\',true)" class="treebutton">Hierarchy</a>';
    html+=' <a onclick="gui.corePatch().getOpById(\''+op.id+'\').exposeNode(\''+node.name+'\')" class="treebutton">Node</a>';
    html+='&nbsp;';

    html+='<span class="icon iconhover icon-eye '+hideclass+'" onclick="gui.corePatch().getOpById(\''+op.id+'\').toggleNodeVisibility(\''+node.name+'\');this.classList.toggle(\'node-hidden\');"></span>';
    html+='</td>';

    html+="</tr>";

    if(node.children)
        for(i=0;i<node.children.length;i++)
            html=printNode(html,gltf.nodes[node.children[i]],level+1);

    return html;
}

function printMaterial(mat,idx)
{
    var html='<tr>';
    html+=' <td>'+idx+'</td>';
    html+=' <td>'+mat.name+'</td>';
    // html+=' <td><a onclick="" class="treebutton">Assign</a><td>';



    html+=' <td>';
    if(mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor)
    {
        var rgb='';
        rgb+=''+Math.round(mat.pbrMetallicRoughness.baseColorFactor[0]*255);
        rgb+=','+Math.round(mat.pbrMetallicRoughness.baseColorFactor[1]*255);
        rgb+=','+Math.round(mat.pbrMetallicRoughness.baseColorFactor[2]*255);

        html+='<div style="width:15px;height:15px;;background-color:rgb('+rgb+')">&nbsp;</a>';

        // html+='<td>';
    }
    html+=' <td style="">'+(gltf.shaders[idx]?"-":'<a onclick="gui.corePatch().getOpById(\''+op.id+'\').assignMaterial(\''+mat.name+'\')" class="treebutton">Assign</a>')+'<td>';
    html+='<td>';



    // console.log();


    html+='</tr>';
    return html;
}

function printInfo()
{
    if(!gltf)return;

    // console.log(gltf);

    const sizes={};

    var html='<div style="overflow:scroll;width:100%;height:100%">';


    html+='generator:'+gltf.json.asset.generator;


    if(!gltf.json.materials || gltf.json.materials.length==0)
    {
        html+='<h3>Materials</h3>';
        html+="No materials";
    }
    else
    {
        html+='<h3>Materials ('+gltf.json.materials.length+')</h3>';
        html+='<table class="table treetable">';
        html+='<tr>';
        html+=' <th>Index</th>';
        html+=' <th>Name</th>';
        html+=' <th>Color</th>';
        html+=' <th>Function</th>';
        html+=' <th></th>';
        html+='</tr>';
        for(var i=0;i<gltf.json.materials.length;i++)
        {
            html+=printMaterial(gltf.json.materials[i],i);
        }
        html+='</table>';
    }

    html+='<h3>Nodes ('+gltf.nodes.length+')</h3>';
    html+='<table class="table treetable">';

    html+='<tr>';
    html+=' <th colspan="21">Name</th>';
    html+=' <th>Mesh</th>';
    html+=' <th>Skin</th>';
    html+=' <th>Material</th>';
    html+=' <th>Anim</th>';
    html+=' <th>Show</th>';
    html+='</tr>';

    for(var i=0;i<gltf.nodes.length;i++)
    {
        if(!gltf.nodes[i].isChild)
            html=printNode(html,gltf.nodes[i],1);
    }
    html+='</table>';

    html+='<h3>Meshes ('+gltf.json.meshes.length+')</h3>';

    html+='<table class="table treetable">';
    html+='<tr>';
    html+=' <th>Name</th>';
    html+=' <th>Material</th>';
    html+=' <th>Vertices</th>';
    html+=' <th>Attributes</th>';
    html+='</tr>';


    var sizeBufferViews=[];
    sizes.meshes=0;

    for(var i=0;i<gltf.json.meshes.length;i++)
    {
        html+='<tr>';
        html+='<td>'+gltf.json.meshes[i].name+"</td>";


        html+='<td>';
        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
        {
            if(gltf.json.meshes[i].primitives[j].material)
                html+=gltf.json.materials[gltf.json.meshes[i].primitives[j].material].name;
                else html+='None';
        }
        html+='</td>';

        html+='<td>';
        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
        {
            // html+=gltf.json.meshes[i].primitives[j].indices;
            if(gltf.json.meshes[i].primitives[j].attributes.POSITION)
            {
                html+=gltf.json.accessors[gltf.json.meshes[i].primitives[j].attributes.POSITION].count;
            }
        }
        html+='</td>';

        html+='<td>';
        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
            html+=Object.keys(gltf.json.meshes[i].primitives[j].attributes);
        html+='</td>';

        html+='</tr>';


        for(var j=0;j<gltf.json.meshes[i].primitives.length;j++)
        {
            var bufView=gltf.json.accessors[gltf.json.meshes[i].primitives[j].indices].bufferView;

            if(sizeBufferViews.indexOf(bufView)==-1)
            {
                sizeBufferViews.push(bufView);
                if(gltf.json.bufferViews[bufView])sizes.meshes+=gltf.json.bufferViews[bufView].byteLength;
            }

            for(var k in gltf.json.meshes[i].primitives[j].attributes)
            {
                const attr=gltf.json.meshes[i].primitives[j].attributes[k];
                const bufView=gltf.json.accessors[attr].bufferView;

                if(sizeBufferViews.indexOf(bufView)==-1)
                {
                    sizeBufferViews.push(bufView);
                    if(gltf.json.bufferViews[bufView])sizes.meshes+=gltf.json.bufferViews[bufView].byteLength;
                }
            }
        }

    }
    html+='</table>';



    if(gltf.json.animations)
    {
        html+='<h3>Animations ('+gltf.json.animations.length+')</h3>';
        html+='<table class="table treetable">';
        html+='<tr>';
        html+='  <th>Name</th>';
        html+='  <th>Target node</th>';
        html+='  <th>Path</th>';
        html+='  <th>Interpolation</th>';
        html+='  <th>Keys</th>';
        html+='</tr>';

        sizes.animations=0;

        for(var i=0;i<gltf.json.animations.length;i++)
        {
            for(var j=0;j< gltf.json.animations[i].samplers.length;j++)
            {
                var bufView=gltf.json.accessors[gltf.json.animations[i].samplers[j].input].bufferView;
                if(sizeBufferViews.indexOf(bufView)==-1)
                {
                    sizeBufferViews.push(bufView);
                    sizes.animations+=gltf.json.bufferViews[bufView].byteLength;
                }

                var bufView=gltf.json.accessors[gltf.json.animations[i].samplers[j].output].bufferView;
                if(sizeBufferViews.indexOf(bufView)==-1)
                {
                    sizeBufferViews.push(bufView);
                    sizes.animations+=gltf.json.bufferViews[bufView].byteLength;
                }

            }




            for(var j=0;j< gltf.json.animations[i].channels.length;j++)
            {
                html+='<tr>';
                html+='  <td>'+gltf.json.animations[i].name+' ('+i+')</td>';

                html+='  <td>'+gltf.nodes[gltf.json.animations[i].channels[j].target.node].name+'</td>';
                html+='  <td>';
                html+=gltf.json.animations[i].channels[j].target.path+' ';
                html+='  </td>';

                const smplidx=gltf.json.animations[i].channels[j].sampler;
                const smplr=gltf.json.animations[i].samplers[smplidx];

                html+='  <td>'+smplr.interpolation+'</td>'


                html+='  <td>'+gltf.json.accessors[smplr.output].count;+'</td>'



                html+='</tr>';

            }
        }
        html+='</table>';

    }
    else
    {
        html+='<h3>Animations (0)</h3>';
    }

    if(gltf.json.images)
    {
        html+='<h3>Images ('+gltf.json.images.length+')</h3>';
        html+='<table class="table treetable">';

        html+='<tr>';
        html+='  <th>name</th>';
        html+='  <th>type</th>';
        html+='  <th>func</th>';

        html+='</tr>';

        sizes.images=0;

        for(var i=0;i<gltf.json.images.length;i++)
        {
            if(gltf.json.images[i].bufferView)
                sizes.images+=gltf.json.bufferViews[gltf.json.images[i].bufferView].byteLength;

            html+='<tr>';
            html+='<td>'+gltf.json.images[i].name+'</td>';
            html+='<td>'+gltf.json.images[i].mimeType+'</td>';
            html+='<td>';

            let name=gltf.json.images[i].name
            if(name===undefined)name=gltf.json.images[i].bufferView;

            html+='<a onclick="gui.corePatch().getOpById(\''+op.id+'\').exposeTexture(\''+name+'\')" class="treebutton">Expose</a>';
            html+='</td>';

            html+='<tr>';
        }
        html+='</table>';
    }


    if(gltf.json.cameras)
    {
        html+='<h3>Cameras ('+gltf.json.cameras.length+')</h3>';
        html+='<table class="table treetable">';

        html+='<tr>';
        html+='  <th>name</th>';
        html+='  <th>type</th>';
        html+='  <th>info</th>';
        html+='</tr>';

        for(var i=0;i<gltf.json.cameras.length;i++)
        {
            html+='<tr>';
            html+='<td>'+gltf.json.cameras[i].name+'</td>';
            html+='<td>'+gltf.json.cameras[i].type+'</td>';
            html+='<td>';
            html+='yfov: '+Math.round(gltf.json.cameras[i].perspective.yfov*100)/100;
            html+=", ";
            html+='zfar: '+Math.round(gltf.json.cameras[i].perspective.zfar*100)/100;
            html+=", ";
            html+='znear: '+Math.round(gltf.json.cameras[i].perspective.znear*100)/100;
            html+='</td>';

            html+='<tr>';
        }
        html+='</table>';
    }

    if(gltf.json.skins)
    {
        html+='<h3>Skins ('+gltf.json.skins.length+')</h3>';
        html+='<table class="table treetable">';

        html+='<tr>';
        html+='  <th>name</th>';
        html+='  <th>skeleton</th>';
        html+='  <th>total joints</th>';
        html+='</tr>';

        for(var i=0;i<gltf.json.skins.length;i++)
        {
            html+='<tr>';
            html+='<td>'+gltf.json.skins[i].name+'</td>';
            html+='<td>'+gltf.json.skins[i].skeleton+'</td>';
            html+='<td>'+gltf.json.skins[i].joints.length+'</td>';
            html+='<td>';
            html+='</td>';

            html+='<tr>';
        }
        html+='</table>';
    }


    // html+='data size: '+;
    const sizeBin=gltf.json.buffers[0].byteLength;
    html+='<h3>Binary Data ('+readableSize(sizeBin)+')</h3>';


    html+='<table class="table treetable">';
    html+='<tr>';
    html+='  <th>name</th>';
    html+='  <th>size</th>';
    html+='  <th>%</th>';
    html+='</tr>';
    var sizeUnknown=sizeBin;
    for(var i in sizes)
    {
        // html+=i+':'+Math.round(sizes[i]/1024);
        html+='<tr>';
        html+='<td>'+i+'</td>';
        html+='<td>'+readableSize(sizes[i])+' </td>';
        html+='<td>'+Math.round(sizes[i]/sizeBin*100)+'% </td>';
        html+='<tr>';
        sizeUnknown-=sizes[i];
    }

    if(sizeUnknown!=0)
    {
        html+='<tr>';
        html+='<td>unknown</td>';
        html+='<td>'+readableSize(sizeUnknown)+' </td>';
        html+='<td>'+Math.round(sizeUnknown/sizeBin*100)+'% </td>';
        html+='<tr>';
    }

    html+='</table>';
    html+='</div>';

    // CABLES.UI.MODAL.show(html);

    // closeTab();
    tab=new CABLES.UI.Tab("GLTF",{"icon":"cube","infotext":"tab_gltf","padding":true,"singleton":true});
    gui.mainTabs.addTab(tab,true);
    tab.html(html);

    // console.log(gltf);
}

function readableSize(n)
{
    if(n>1024)return Math.round(n/1024)+' kb';
    if(n>1024*500)return Math.round(n/1024)+' mb';
    else return n+' bytes';

}


