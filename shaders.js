
function detectShaderType(shaderScript)
{
    switch(shaderScript.type)
    {
        case "x-shader/x-fragment":
            return gl.FRAGMENT_SHADER
        case "x-shader/x-vertex":
            return gl.VERTEX_SHADER
        default:
            throw "Unrecognized shader type"
    }
}

function getShaderSource(shaderScript)
{
    return shaderScript.innerHTML
}

function getShaderScript(shaderId)
{
    var shaderScript = document.getElementById(shaderId)
    if (!shaderScript)
    {
        throw "Unable to find shader"
    }
    return shaderScript
}

function loadShader(shaderId)
{
    var shaderScript = getShaderScript(shaderId)
    var shaderType = detectShaderType(shaderScript)
    var shaderSource = getShaderSource(shaderScript)
    var shader = gl.createShader(shaderType)

    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        throw "Error in shader"
    }

    return shader
}

function linkShaderProgram(shaders)
{
    var program = gl.createProgram()

    for (var i = 0; i < shaders.length; i++)
    {
        gl.attachShader(program, shaders[i])
    }
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        throw "Error linking shaders"
    }

    return program
}

