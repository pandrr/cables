class ShaderModifier
{
    constructor(cgl, name, options)
    {
        this._cgl = cgl;
        this._name = name;
        this._shaders = {};
        this._uniforms = [];
        this._structUniforms = [];
        this._definesToggled = {};
        this._defines = {};
        this._mods = [];
        this._textures = [];
        this._boundShader = null;
        this._changedDefines = true;
        this._changedUniforms = true;
        this._modulesChanged = false;
        this.needsTexturePush = false;
    }

    bind()
    {
        const shader = this._cgl.getShader();
        if (!shader) return;

        this._boundShader = this._shaders[shader.id];

        if (!this._boundShader || shader.lastCompile != this._boundShader.lastCompile || this._modulesChanged)
        {
            if (this._boundShader) this._boundShader.shader.dispose();

            this._boundShader = this._shaders[shader.id] =
                {
                    "lastCompile": shader.lastCompile,
                    "orig": shader,
                    "shader": shader.copy()
                };

            this._addModulesToShader(this._boundShader.shader);

            this._updateDefinesShader(this._boundShader.shader);
            this._updateUniformsShader(this._boundShader.shader);
        }

        if (this._changedDefines) this._updateDefines();
        if (this._changedUniforms) this._updateUniforms();

        this._cgl.pushShader(this._boundShader.shader);

        this._boundShader.shader.copyUniformValues(this._boundShader.orig);

        if (this.needsTexturePush)
        {
            for (let j = 0; j < this._textures.length; j += 1)
            {
                const uniformName = this._textures[j][0];
                const tex = this._textures[j][1];
                const texType = this._textures[j][2];

                if (this._getUniform(uniformName))
                {
                    const name = this.getPrefixedName(uniformName);
                    const uni = this._boundShader.shader.getUniform(name);

                    if (uni) this._boundShader.shader.pushTexture(uni, tex, texType);
                }
            }

            this.needsTexturePush = false;
            this._textures.length = 0;
        }

        this._modulesChanged = false;
    }

    unbind()
    {
        if (this._boundShader) this._cgl.popShader();
        this._boundShader = null;
    }

    _addModulesToShader(shader)
    {
        let firstMod;

        if (this._mods.length > 1) firstMod = this._mods[0];

        for (let i = 0; i < this._mods.length; i++)
            shader.addModule(this._mods[i], firstMod);
    }

    _removeModulesFromShader(mod)
    {
        for (const j in this._shaders)
            this._shaders[j].shader.removeModule(mod);
    }

    addModule(mod)
    {
        this._mods.push(mod);
        this._modulesChanged = true;
    }

    removeModule(title)
    {
        const indicesToRemove = [];

        for (let i = 0; i < this._mods.length; i++)
        {
            if (this._mods[i].title == title)
            {
                this._removeModulesFromShader(this._mods[i]);
                indicesToRemove.push(i);
            }
        }

        // * go in reverse order so the indices of the mods stay the same
        for (let j = indicesToRemove.length - 1; j >= 0; j -= 1)
            this._mods.splice(indicesToRemove[j], 1);

        this._modulesChanged = true;
    }

    _updateUniformsShader(shader)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            const uni = this._uniforms[i];
            const name = this.getPrefixedName(uni.name);

            if (!shader.hasUniform(name) && !uni.structName)
            {
                let un = null;
                if (uni.shaderType === "both")
                {
                    un = shader.addUniformBoth(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4);
                    un.comment = "mod: " + this._name;
                }
                else if (uni.shaderType === "frag")
                {
                    un = shader.addUniformFrag(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4);
                    un.comment = "mod: " + this._name;
                }
                else if (uni.shaderType === "vert")
                {
                    un = shader.addUniformVert(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4);
                    un.comment = "mod: " + this._name;
                }
            }
            else
            {
            }
        }

        for (let j = 0; j < this._structUniforms.length; j += 1)
        {
            const structUniform = this._structUniforms[j];
            let structUniformName = structUniform.uniformName;
            let structName = structUniform.structName;

            const members = structUniform.members;
            const structPropertyName = structUniform.propertyName;

            structUniformName = this.getPrefixedName(structUniform.uniformName);
            structName = this.getPrefixedName(structUniform.structName);

            if (structUniform.shaderType === "frag")
            {
                shader.addUniformStructFrag(structName, structUniformName, members);
            }
            if (structUniform.shaderType === "vert")
            {
                shader.addUniformStructVert(structName, structUniformName, members);
            }
            if (structUniform.shaderType === "both")
            {
                shader.addUniformStructBoth(structName, structUniformName, members);
            }
        }
    }

    _updateUniforms()
    {
        for (const j in this._shaders)
            this._updateUniformsShader(this._shaders[j].shader);

        this._changedUniforms = false;
    }

    _setUniformValue(shader, uniformName, value)
    {
        const uniform = shader.getUniform(uniformName);
        if (uniform) uniform.setValue(value);
    }

    setUniformValue(name, value)
    {
        const uni = this._getUniform(name);
        if (!uni) return;

        const defineName = this.getPrefixedName(name);

        for (const j in this._shaders)
        {
            this._setUniformValue(this._shaders[j].shader, defineName, value);
        }
    }

    hasUniform(name)
    {
        return this._getUniform(name);
    }

    _getUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].name == name) return this._uniforms[i];
            if (this._uniforms[i].structName)
            {
                if (this._uniforms[i].propertyName == name) return this._uniforms[i];
            }
        }
        return false;
    }

    _getStructUniform(uniName)
    {
        for (let i = 0; i < this._structUniforms.length; i += 1)
        {
            if (this._structUniforms[i].uniformName === uniName) return this._structUniforms[i];
        }

        return null;
    }

    _isStructUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].name == name) return false;
            if (this._uniforms[i].structName)
            {
                if (this._uniforms[i].propertyName == name) return true;
            }
        }
        return false;
    }


    addUniform(type, name, valOrPort, v2, v3, v4, structUniformName, structName, propertyName, shaderType)
    {
        if (!this._getUniform(name))
        {
            let _shaderType = "both";
            if (shaderType) _shaderType = shaderType;

            this._uniforms.push(
                {
                    "type": type,
                    "name": name,
                    "v1": valOrPort,
                    "v2": v2,
                    "v3": v3,
                    "v4": v4,
                    "structUniformName": structUniformName,
                    "structName": structName,
                    "propertyName": propertyName,
                    "shaderType": _shaderType,
                });
            this._changedUniforms = true;
        }
    }

    addUniformFrag(type, name, valOrPort, v2, v3, v4)
    {
        this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "frag");
    }

    addUniformVert(type, name, valOrPort, v2, v3, v4)
    {
        this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "vert");
    }

    addUniformBoth(type, name, valOrPort, v2, v3, v4)
    {
        this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "both");
    }

    addUniformStruct(structName, uniformName, members, shaderType)
    {
        for (let i = 0; i < members.length; i += 1)
        {
            const member = members[i];
            if ((member.type === "2i" || member.type === "i" || member.type === "3i") && shaderType === "both")
                console.error("Adding an integer struct member to both shaders can potentially error. Please use different structs for each shader. Error occured in struct:", structName, " with member:", member.name, " of type:", member.type, ".");

            if (!this._getUniform(uniformName + "." + member.name))
            {
                this.addUniform(
                    member.type,
                    uniformName + "." + member.name,
                    member.v1,
                    member.v2,
                    member.v3,
                    member.v4,
                    uniformName,
                    structName,
                    member.name,
                    shaderType
                );
            }
        }
        if (!this._getStructUniform(uniformName))
        {
            this._structUniforms.push({
                "structName": structName,
                "uniformName": uniformName,
                "members": members,
                "shaderType": shaderType,
            });
        }
    }

    addUniformStructVert(structName, uniformName, members)
    {
        this.addUniformStruct(structName, uniformName, members, "vert");
    }

    addUniformStructFrag(structName, uniformName, members)
    {
        this.addUniformStruct(structName, uniformName, members, "frag");
    }

    addUniformStructBoth(structName, uniformName, members)
    {
        this.addUniformStruct(structName, uniformName, members, "both");
    }


    pushTexture(uniformName, tex, texType)
    {
        if (!tex) throw (new Error("no texture given to texturestack"));

        this._textures.push([uniformName, tex, texType]);
        this.needsTexturePush = true;
    }

    _removeUniformFromShader(name, shader)
    {
        if (shader.hasUniform(name)) shader.removeUniform(name);
    }

    removeUniform(name)
    {
        if (this._getUniform(name))
        {
            for (let j = this._uniforms.length - 1; j >= 0; j -= 1)
            {
                const nameToRemove = name;

                if (this._uniforms[j].name == name && !this._uniforms[j].structName)
                {
                    for (const k in this._shaders)
                    {
                        this._removeUniformFromShader(
                            this.getPrefixedName(nameToRemove),
                            this._shaders[k].shader
                        );
                    }

                    this._uniforms.splice(j, 1);
                }
            }
            this._changedUniforms = true;
        }
    }

    removeUniformStruct(uniformName)
    {
        if (this._getStructUniform(uniformName))
        {
            for (let i = this._structUniforms.length - 1; i >= 0; i -= 1)
            {
                const structToRemove = this._structUniforms[i];

                if (structToRemove.uniformName === uniformName)
                {
                    for (const j in this._shaders)
                    {
                        for (let k = 0; k < structToRemove.members.length; k += 1)
                        {
                            const member = structToRemove.members[k];
                            this._removeUniformFromShader(
                                this.getPrefixedName(member.name),
                                this._shaders[j].shader
                            );
                        }
                    }

                    this._structUniforms.splice(i, 1);
                }
            }

            this._changedUniforms = true;
        }
    }


    getPrefixedName(name)
    {
        const prefix = this._mods[0].group;
        if (prefix === undefined)
        {
            return;
        }
        if (name.indexOf("MOD_") == 0)
        {
            name = name.substr("MOD_".length);
            name = "mod" + prefix + name;
        }
        return name;
    }

    _updateDefinesShader(shader)
    {
        for (const i in this._defines)
        {
            const name = this.getPrefixedName(i);
            if (this._defines[i] !== null && this._defines[i] !== undefined) shader.define(name, this._defines[i]);
            else shader.removeDefine(name);
        }

        for (const i in this._definesToggled)
        {
            const name = this.getPrefixedName(i);
            shader.toggleDefine(name, this._definesToggled[i]);
        }
    }

    _updateDefines()
    {
        for (const j in this._shaders) this._updateDefinesShader(this._shaders[j].shader);

        this._changedDefines = false;
    }

    define(what, value)
    {
        this._defines[what] = value;
        this._changedDefines = true;
    }

    removeDefine(name)
    {
        this._defines[name] = null;
        this._changedDefines = true;
    }

    hasDefine(name)
    {
        if (this._defines[name] !== null && this._defines[name] !== undefined) return true;
        return false;
    }

    toggleDefine(name, b)
    {
        this._changedDefines = true;
        this._definesToggled[name] = b;
    }

    currentShader()
    {
        return this._boundShader.shader;
    }

    dispose()
    {

    }
}


export { ShaderModifier };
