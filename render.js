function RenderState(gl, gfxstore, matrixUniforms, aVertexPosition, aTexCoord, uTexture)
{
    this.PROJECTION_STACK = 0
    this.MODELVIEW_STACK = 1

    this.gfxstore = gfxstore

    this.matrixUniforms = matrixUniforms
    this.aVertexPosition = aVertexPosition
    this.aTexCoord = aTexCoord
    this.uTexture = uTexture

    this.transformstack = matrixUniforms.map(function(){return [identityMatrix4.slice(0)]})

    this.setVertexBuffer = function(mesh)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gfxstore.buffers.getResource(mesh))

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

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gfxstore.elementbuffers.getResource(indices))
        gl.drawElements(primitive, numindices, indextype, 0)
    }
}


