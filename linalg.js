
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
    m[at4(3, 0)] = x
    m[at4(3, 1)] = y
    m[at4(3, 2)] = z
    return m
}

function at4(row, col)
{
    return row*4 + col
}
