function SGNode()
{
    SGNode.DRAW = 0
    SGNode.CALLBACK = 1

    this.children = []
    this.parent = null
    this.mode = SGNode.DRAW

    this.attach = function(child)
    {
        this.children.push(child)
        child.parent = this
        return child
    }

    this.attachP = function(children)
    {
        for (var i = 0; i < children.length; i++)
        {
            this.attach(children[i])
        }
        return this
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

    this.updateWith = function(mode, rs)
    {
        this.mode = mode
        this.update(rs)
    }

    this.update = function(rs)
    {
        this.updateChildren(rs)
    }

    this.updateChildren = function(rs)
    {
        for (var i = 0; i < this.children.length; i++)
        {
            var child = this.children[i]
            child.mode = this.mode
            child.update(rs)
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
        return mat4mul(rs.transformstack[this.stack][0], this.matrix)
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

function BillboardNode(localstack, projectionstack)
{
    TransformNode.call(this, localstack)
    this.projectionstack = projectionstack

    this.calculateMatrix = function(rs)
    {
        var pM = rs.transformstack[this.projectionstack][0]
        var pM_inv = mat4inv(pM)

        var v_right =   vec3norm(mat4vec3mul(pM_inv, [1, 0, 0]))
        var v_up =      vec3norm(mat4vec3mul(pM_inv, [0, 1, 0]))
        var v_look =    vec3norm(mat4vec3mul(pM_inv, [0, 0, 1]))

        var m = 
            [ v_right[0],   v_right[1], v_right[2], 0
            , v_up[0],      v_up[1],    v_up[2],    0
            , v_look[0],    v_look[1],  v_look[2],  0
            , 0,            0,          0,          1
            ]

        return mat4mul(rs.transformstack[this.stack][0], m)
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
        var translateM = translationMatrix4(this.x, this.y, this.z)

        var yawM = identityMatrix4.slice(0)         // Rotate around z-axis
        yawM[at4(0, 0)] = Math.cos(this.yaw)
        yawM[at4(2, 0)] = Math.sin(this.yaw)
        yawM[at4(0, 2)] = -Math.sin(this.yaw)
        yawM[at4(2, 2)] = Math.cos(this.yaw)

        var pitchM = identityMatrix4.slice(0)       // Rotate around x-axis
        pitchM[at4(1, 1)] = Math.cos(this.pitch)
        pitchM[at4(2, 1)] = -Math.sin(this.pitch)
        pitchM[at4(1, 2)] = Math.sin(this.pitch)
        pitchM[at4(2, 2)] = Math.cos(this.pitch)

        var dM = identityMatrix4.slice(0)           // Slide along y-axis
        dM[at4(2, 3)] = this.d
        
        m = mat4mul(rs.transformstack[this.stack][0], dM)
        m = mat4mul(m, pitchM)
        m = mat4mul(m, yawM)
        m = mat4mul(m, translateM)

        return m
    }

    this.scan = function(dx, dy, dz)
    {
        this.x += dx
        this.y += dy
        this.z += dz
    }

    this.pan = function(yaw, pitch)
    {
        this.yaw += yaw
        this.pitch += pitch
    }

    this.zoom = function(k)
    {
        this.d += k
    }
}

function CallbackNode(targetmode)
{
    SGNode.call(this)
    this.targetmode = targetmode

    this.update = function(rs)
    {
        if (this.mode == this.targetmode)
        {
            this.onTraverse(rs)
        }
        this.updateChildren(rs)
    }

    this.onTraverse = function(rs) {}
}

function BBoxNode(bag, hitid, stackorder)
{
    CallbackNode.call(this, SGNode.CALLBACK)
    this.stackorder = stackorder
    this.bag = bag
    this.id = hitid

    this.onTraverse = function(rs)
    {
        var m = stackorder.reduce(function(prev, current, index, array)
            {
                var m1 = rs.transformstack[prev][0]
                var m2 = rs.transformstack[current][0]
                return mat4mul(m1, m2)
            })

        this.bag.push({"transform": m, "id": this.id})
    }
}

function ApplyTransform(stacks)
{
    SGNode.call(this)
    this.stacks = stacks

    this.update = function(rs)
    {
        if (this.mode == SGNode.DRAW)
        {
            rs.applyTransform(this.stacks)
        }
        this.updateChildren(rs)
    }
}

function RenderNode(mesh, primitive, texture)
{
    SGNode.call(this)
    this.mesh = mesh
    this.primitive = primitive
    this.texture = texture

    this.update = function(rs)
    {
        if (this.mode == SGNode.DRAW)
        {
            rs.render(this.mesh, this.primitive, this.texture)
        }
    }
}

function IndexedRenderNode(vertices, primitive, texture, indices, indextype)
{
    SGNode.call(this)
    this.vertices = vertices
    this.primitive = primitive
    this.texture = texture
    this.indices = indices
    this.indextype = indextype

    this.update = function(rs)
    {
        if (this.mode == SGNode.DRAW)
        {
            rs.renderIndexed(this.vertices, this.primitive, this.texture, this.indices, this.indextype)
        }
    }
}

