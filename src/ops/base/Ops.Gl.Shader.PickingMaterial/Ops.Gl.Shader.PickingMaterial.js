    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='PickingMaterial';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.isPicked=this.addOutPort(new Port(this,"is picked",OP_PORT_TYPE_VALUE));
    this.doBillboard=this.addInPort(new Port(this,"billboard",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    this.doBillboard.set(false);
    this.doBillboard.onValueChanged=function()
    {
        if(self.doBillboard.get())
            shader.define('BILLBOARD');
        else
            shader.removeDefine('BILLBOARD');
    };



    this.doRender=function()
    {

        cgl.frameStore.pickingpassNum+=4;
        var currentPickingColor=cgl.frameStore.pickingpassNum;



        if(cgl.frameStore.pickingpass)
        {
            self.isPicked.set(false);
            
            
            pickColorUniformR.setValue(currentPickingColor/255);
            cgl.setShader(shader);
            self.trigger.trigger();
            cgl.setPreviousShader();
        }
        else
        {
            if(cgl.frameStore.pickedColor==currentPickingColor)
            {
                // console.log('picked !',cgl.frameStore.pickedColor,currentPickingColor);
            }
            self.isPicked.set( cgl.frameStore.pickedColor==currentPickingColor );

            self.trigger.trigger();
        }

    };

    var srcVert=''
        .endl()+'attribute vec3 vPosition;'
        .endl()+'attribute vec2 attrTexCoord;'
        .endl()+'attribute vec3 attrVertNormal;'
        .endl()+'varying vec2 texCoord;'
        .endl()+'varying vec3 norm;'
        .endl()+'uniform mat4 projMatrix;'
        .endl()+'uniform mat4 mvMatrix;'
        // .endl()+'uniform mat4 normalMatrix;'
        
        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   texCoord=attrTexCoord;'
        .endl()+'   norm=attrVertNormal;'
        
        .endl()+'   #ifdef BILLBOARD'

        .endl()+'   vec3 position=vPosition;'
        .endl()+"   gl_Position = projMatrix * mvMatrix * vec4(( "
        .endl()+"       position.x * vec3("
        .endl()+"           mvMatrix[0][0],"
        .endl()+"           mvMatrix[1][0], "
        .endl()+"           mvMatrix[2][0] ) +"
        .endl()+"       position.y * vec3("
        .endl()+"           mvMatrix[0][1],"
        .endl()+"           mvMatrix[1][1], "
        .endl()+"           mvMatrix[2][1]) ), 1.0);"
        .endl()+'    #endif '

        .endl()+"#ifndef BILLBOARD"
        .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
        .endl()+'#endif '

        .endl()+'}';




    var srcFrag=''
        .endl()+'precision highp float;'
        .endl()+'varying vec3 norm;'
        .endl()+'uniform float r;'
        .endl()+''
        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   vec4 col=vec4(r,1.0,0.0,1.0);'
        .endl()+'   gl_FragColor = col;'
        .endl()+'}';

    var shader=new CGL.Shader(cgl);
    shader.offScreenPass=true;
    this.onLoaded=shader.compile;

    shader.setSource(srcVert,srcFrag);

    var pickColorUniformR=new CGL.Uniform(shader,'f','r',0);

    this.render.onTriggered=this.doRender;
    this.doRender();