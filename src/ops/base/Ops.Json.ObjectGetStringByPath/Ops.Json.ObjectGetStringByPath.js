const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const returnPathIn = op.inBool("Output path if missing", false);
const resultOut = op.outString("Output");
const foundOut = op.outBool("Found");

objectIn.ignoreValueSerialize = true;

objectIn.onChange = update;
pathIn.onChange = update;
returnPathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            let result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                let errorLevel = 2;
                result = null;
                foundOut.set(false);
                if (returnPathIn.get())
                {
                    result = path;
                    errorLevel = 1;
                }
                else
                {
                    result = null;
                }
                op.setUiError("missing", errorMsg, errorLevel);
            }
            else
            {
                foundOut.set(true);
                result = String(result);
            }
            resultOut.set(result);
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}
