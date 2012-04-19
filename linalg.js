
var zeroMatrix4 = 
    [ 0.0, 0.0, 0.0, 0.0
    , 0.0, 0.0, 0.0, 0.0
    , 0.0, 0.0, 0.0, 0.0
    , 0.0, 0.0, 0.0, 0.0 ]
    
var identityMatrix4 = 
    [ 1.0, 0.0, 0.0, 0.0
    , 0.0, 1.0, 0.0, 0.0
    , 0.0, 0.0, 1.0, 0.0
    , 0.0, 0.0, 0.0, 1.0 ]

function mat4mul(m1, m2)
{
    var m = zeroMatrix4.slice(0)
    for (var i = 0; i < 4; i++)
    {
        for (var j = 0; j < 4; j++)
        {
            for (var k = 0; k < 4; k++)
            {
                m[at4(i, j)] += m1[at4(i, k)] * m2[at4(k, j)]
            }
        }
    }
    return m
}

function mat4scale(m, scalar)
{
    var mr = m.slice(0)
    for (var i = 0; i < 16; i++)
    {
        mr[i] *= scalar
    }
    return mr
}

function scaleMatrix4(scale)
{
    var m = identityMatrix4.slice(0)
    m[at4(0, 0)] = scale
    m[at4(1, 1)] = scale
    m[at4(2, 2)] = scale
    return m
}

function translationMatrix4(x, y, z)
{
    var m = identityMatrix4.slice(0)
    m[at4(0, 3)] = x
    m[at4(1, 3)] = y
    m[at4(2, 3)] = z
    return m
}

/*
 * Multiplicate 4x4 matrix with homogeneous 3 element vector (4:th vector element 1)
 */
function mat4hvec3mul(m, v)
{
    var w = mat4vec3mul(m, v)
    for (var i = 0; i < 3; i++)
    {
        w[i] += m[at4(i, 3)]
    }
    return w
}

/*
 * Multiplicate 4x4 matrix with 3 element vector (assume vector 4:th element 0)
 */
function mat4vec3mul(m, v)
{
    var w = [0, 0, 0]
    for (var i = 0; i < 3; i++)
    {
        for (var j = 0; j < 3; j++)
        {
            w[i] += m[at4(i, j)] * v[j]
        }
    }
    return w
}

function scalarProd3(v, w)
{
    var result = 0
    for (var i = 0; i < 3; i++)
    {
        result += v[i]*w[i]
    }
    return result
}

function vec3scale(v, s)
{
    var w = v.slice(0)
    for (var i = 0; i < 3; i++)
    {
        w[i] *= s
    }
    return w
}

function vec3add(v, w)
{
    var r = v.slice(0)
    for (var i = 0; i < 3; i++)
    {
        r[i] = v[i] + w[i]
    }
    return r
}

function vec3sub(v, w)
{
    return vec3add(v, vec3scale(w, -1))
}

function vec3magnitude(v)
{
    return Math.sqrt(scalarProd3(v, v))
}

function vec3norm(v)
{
    return vec3scale(v, 1/vec3magnitude(v))
}

// Closest point on a line to origin
function closestPointOnLine(x0, v)
{
    var t1 = scalarProd3(x0, v) / scalarProd3(v, v)
    return vec3add(x0, vec3scale(v, t1))
}

function at4(row, col)
{
    return row + col * 4
}

function mat4inv(m)
{
    var n = m.slice(0)
    var inv = identityMatrix4.slice(0)

    // Ensure non-zero diagonal
    for (var i = 0; i < 4; i++)
    {
        if (n[at4(i, i)] == 0)
        {
            for (var j = 0; j < 4; j++)
            {
                if (n[at4(j, i)] != 0)
                {
                    for (var k = 0; k < 4; k++)
                    {
                        n[at4(i, k)] += n[at4(j, k)]
                        inv[at4(i, k)] += inv[at4(j, k)]
                    }
                }
            }
        }
        if (n[at4(i, i)] == 0)
        {
            throw "Non-invertable Matrix"
        }
    }

    // Eliminate
    for (var i = 0; i < 4; i++)
    {
        for (var j = i + 1; j < 4; j++)
        {
            var c = n[at4(j, i)] / n[at4(i, i)]
            for (var k = 0; k < 4; k++)
            {
                n[at4(j, k)] -= n[at4(i, k)] * c
                inv[at4(j, k)] -= inv[at4(i, k)] * c
            }
        }
    }

    // Back-substitute
    for (var i = 3; i >= 0; i--)
    {
        for (var j = 0; j < i; j++)
        {
            var c = n[at4(j, i)] / n[at4(i, i)]
            for (var k = 0; k < 4; k++)
            {
                n[at4(j, k)] -= n[at4(i, k)] * c
                inv[at4(j, k)] -= inv[at4(i, k)] * c
            }
        }
    }

    // Normalize
    for (var i = 0; i < 4; i++)
    {
        for (var k = 0; k < 4; k++)
        {
            inv[at4(i, k)] /= n[at4(i, i)]
        }
    }

    return inv
}

