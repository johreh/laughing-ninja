function RenderState(gl, gfxstore, matrixUniforms, aVertexPosition, aTexCoord, uTexture)
{
    this.gfxstore = gfxstore

    this.matrixUniforms = matrixUniforms
    this.aVertexPosition = aVertexPosition
    this.aTexCoord = aTexCoord
    this.uTexture = uTexture

    this.transformstack = matrixUniforms.map(function(){return [identityMatrix4.slice(0)]})

    this.setVertexBuffer = function(mesh)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gfxstore.arrays.getResource(mesh))

        gl.vertexAttribPointer(
            this.aVertexPosition,     // Attribute
            3,          // elements/attribute
            gl.FLOAT,   // element size
            false,      // Normalize?
            4*5,          // Stride
            0)          // Buffer offset

        gl.vertexAttribPointer(
            this.aTexCoord,
            2,
            gl.FLOAT,
            false,
            4*5,
            4*3)

        gl.enableVertexAttribArray(this.aVertexPosition)
        gl.enableVertexAttribArray(this.aTexCoord)
    }

    this.setTexture = function(texture)
    {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.gfxstore.textures.getResource(texture))
        gl.uniform1i(uTexture, 0)
    }

    this.applyTransform = function(stacks)
    {
        for (var i = 0; i < stacks.length; i++)
        {
            var s = stacks[i]
            gl.uniformMatrix4fv(
                this.matrixUniforms[s], 
                false, 
                this.transformstack[s][0])
        }
    }

    this.render = function(mesh, primitive, texture)
    {
        var numvertices = resources.resources[mesh].length / 5

        this.setVertexBuffer(mesh)
        this.setTexture(texture)
        gl.drawArrays(primitive, 0, numvertices)
    }

    this.renderIndexed = function(vertices, primitive, texture, indices, indextype)
    {
        var numindices = resources.resources[indices].length

        this.setVertexBuffer(vertices)
        this.setTexture(texture)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gfxstore.elementarrays.getResource(indices))
        gl.drawElements(primitive, numindices, indextype, 0)
    }

    this.renderLine = function(x0, x1)
    {
        var b = gl.createBuffer()
        bufferArray(b, new Float32Array(x0.concat(x1)), gl.ARRAY_BUFFER, gl.STREAM_DRAW)
        gl.vertexAttribPointer(
            this.aVertexPosition,     // Attribute
            3,          // elements/attribute
            gl.FLOAT,   // element size
            false,      // Normalize?
            0,          // Stride
            0)          // Buffer offset

        gl.drawArrays(gl.LINES, 0, 2)

        gl.deleteBuffer(b)
    }
}


