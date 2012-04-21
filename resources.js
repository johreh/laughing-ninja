
function bufferMesh(buffer, mesh)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW)
    return buffer
}

function bufferTexture(texture, img)
{
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return texture
}

function loadImage(src, onload)
{
    var img = new Image()
    img.onload = (function() { onload(img) })
    img.src = src
    return img
}

function Resources()
{
    this.pendingresources = 0
    this.resources = {}
    this.loadfinished = function() {}

    this.flush = function()
    {
        this.resouces = {}
    }

    this.load = function(images, meshes)
    {
        var thisptr = this
        for (imgid in images)
        {
            var f = function(img)
            {
                thisptr.pendingresources -= 1
                if (thisptr.pendingresources == 0)
                {
                    thisptr.loadfinished()
                }
            }
            thisptr.pendingresources += 1
            this.resources[imgid] = loadImage(images[imgid], f)
        }
        for (meshid in meshes)
        {
            this.resources[meshid] = meshes[meshid]
        }
    }
}

function ResourceStack(resourcestore, maxresources, fcreate, fbuffer, fdelete)
{
    /* Max number of resources to keep in Gfx memory */
    this.maxresources = maxresources

    /* Map from resource identifier to WebGL handle */
    this.resourcetable = {}

    /* Keeps track of currently loaded resource identifiers */
    this.queue = []

    this.flush = function()
    {
        while (queue.length > 0)
        {
            this.popResource()
        }
    }

    this.popResource = function()
    {
        this.identifier = this.queue.shift()
        fdelete(this.resourcetable[identifier])
        delete this.resourcetable[identifier]
    }

    this.pushResource = function(identifier, resource)
    {
        this.queue.unshift(identifier)
        this.resourcetable[identifier] = resource
    }

    this.getResource = function(identifier)
    {
        if (identifier in this.resourcetable)
        {
            return this.resourcetable[identifier]
        }
        else
        {
            if (this.queue.length >= this.max)
            {
                this.popResource()
            }
            
            var handle = fcreate()
            var resource = resourcestore.resources[identifier]
            fbuffer(handle, resource)

            this.pushResource(identifier, handle)
            return handle
        }
    }
}

function GfxStore(gl, resourcestore, maxbuffers, maxtextures)
{
    this.textures = new ResourceStack(
        resourcestore, 
        maxtextures, 
        function(){ return gl.createTexture() },
        bufferTexture,
        function(handle){ gl.deleteTexture(handle) })

    this.buffers = new ResourceStack(
        resourcestore,
        maxbuffers,
        function(){ return gl.createBuffer() },
        bufferMesh,
        function(handle){ gl.deleteBuffer(handle) })

    this.flush = function()
    {
        this.textures.flush()
        this.buffers.flush()
    }
}

