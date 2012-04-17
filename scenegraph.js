function SGNode()
{
    this.children = []
    this.parent = null

    this.attach = function(child)
    {
        this.children.push(child)
        child.parent = this
        return child
    }

    this.remove = function()
    {
        if (this.parent != null)
        {
            var childIndex = this.parent.children.indexOf(this)
            this.parent.children.splice(childIndex, 1)
            this.parent = null
        }
    }

    this.update = function(rs)
    {
        this.updateChildren(rs)
    }

    this.updateChildren = function(rs)
    {
        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i].update(rs)
        }
    }
}

function TransformNode(stack)
{
    SGNode.call(this)
    this.stack = stack

    this.update = function(rs)
    {
        var m = this.calculateMatrix(rs)

        rs.transformstack[this.stack].unshift(m)
        this.updateChildren(rs)
        rs.transformstack[this.stack].shift()
    }

    this.calculateMatrix = function(rs)
    {
        return identityMatrix4
    }
}

function MatrixNode(stack, matrix)
{
    TransformNode.call(this, stack)
    this.matrix = matrix.slice(0)

    this.calculateMatrix = function(rs)
    {
        return mat4mul(this.matrix, rs.transformstack[this.stack][0])
    }
}

function IdentityNode(stack)
{
    TransformNode.call(this, stack)

    this.calculateMatrix = function(rs)
    {
        return identityMatrix4
    }
}

function DollyNode(stack)
{
    TransformNode.call(this, stack)
    this.x = 0
    this.y = 0
    this.z = 0
    this.yaw = 0
    this.pitch = 0
    this.d = 0.0

    this.calculateMatrix = function(rs)
    {
//        var zoomM = scaleMatrix4(this.d)
        var translateM = translationMatrix4(this.x, this.y, this.z)

        var yawM = identityMatrix4.slice(0)
        yawM[at4(0, 0)] = Math.cos(this.yaw)
        yawM[at4(2, 0)] = Math.sin(this.yaw)
        yawM[at4(0, 2)] = -Math.sin(this.yaw)
        yawM[at4(2, 2)] = Math.cos(this.yaw)

        var pitchM = identityMatrix4.slice(0)
        pitchM[at4(1, 1)] = Math.cos(this.pitch)
        pitchM[at4(2, 1)] = -Math.sin(this.pitch)
        pitchM[at4(1, 2)] = Math.sin(this.pitch)
        pitchM[at4(2, 2)] = Math.cos(this.pitch)

        var dM = identityMatrix4.slice(0)
        dM[at4(2, 2)] = this.d
        
        var m = mat4mul(translateM, rs.transformstack[this.stack][0])
        m = mat4mul(yawM, m)
        m = mat4mul(pitchM, m)
        m = mat4mul(dM, m)

        return m
    }

    this.pan = function(dx, dy, dz)
    {
        this.x += dx
        this.y += dy
        this.z += dz
    }

    this.scan = function(yaw, pitch)
    {
        this.yaw += yaw
        this.pitch += pitch
    }

    this.zoom = function(k)
    {
        this.d += k
    }
}

function ApplyTransform(stacks)
{
    SGNode.call(this)
    this.stacks = stacks

    this.update = function(rs)
    {
        for (var i = 0; i < this.stacks.length; i++)
        {
            gl.uniformMatrix4fv(rs.matrixUniforms[i], false, rs.transformstack[i][0])
        }
        this.updateChildren()
    }
}

function RenderNode(aVertexPosition)
{
    SGNode.call(this)
    this.aVertexPosition = aVertexPosition

    this.update = function(rs)
    {
        var triangle = 
            [ -0.5,  0.5,  0.0
            , -0.5, -0.5,  0.0
            ,  0.5,  0.5,  0.0
            ,  0.5, -0.5,  0.0
            ]

        var triangleVertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STREAM_DRAW)

        gl.vertexAttribPointer(
            this.aVertexPosition,     // Attribute
            3,          // elements/attribute
            gl.FLOAT,   // element size
            false,      // Normalize?
            0,          // Stride
            0)          // Buffer offset

        gl.enableVertexAttribArray(this.aVertexPosition)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        gl.deleteBuffer(triangleVertexBuffer)
    }
}

