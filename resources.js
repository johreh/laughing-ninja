
function bufferArray(buffer, array, buffertype, usage)
{
    gl.bindBuffer(buffertype, buffer)
    gl.bufferData(buffertype, array, usage)
    return buffer
}

function bufferTexture(texture, img)
{
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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

function GfxStore(gl, resourcestore, maxarrays, maxtextures, maxindices)
{
    this.textures = new ResourceStack(
        resourcestore, 
        maxtextures, 
        function(){ return gl.createTexture() },
        bufferTexture,
        function(handle){ gl.deleteTexture(handle) })

    this.arrays = new ResourceStack(
        resourcestore,
        maxarrays,
        function(){ return gl.createBuffer() },
        function(buffer, mesh){ bufferArray(buffer, mesh, gl.ARRAY_BUFFER, gl.STATIC_DRAW) },
        function(handle){ gl.deleteBuffer(handle) })

    this.elementarrays = new ResourceStack(
        resourcestore,
        maxindices,
        function(){ return gl.createBuffer() },
        function(buffer, mesh){ bufferArray(buffer, mesh, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW) },
        function(handle){ gl.deleteBuffer(handle) })

    this.flush = function()
    {
        this.textures.flush()
        this.arrays.flush()
        this.elementarrays.flush()
    }
}

