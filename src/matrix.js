let {sqrt, pow} = Math

export let Mult = (n, v) => ({x: n * v.x, y: n * v.y})
export let Add  = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y})
export let Subtract = (v1, v2) => Add(v1, Mult(-1, v2))
export let Magnitude = ({x, y}) => sqrt(pow(x, 2) + pow(y, 2))
export let Midpoint = (v1, v2) => Mult(1/2, Add(v1, v2))
export let Distance = (v1, v2) => Magnitude(Subtract(v1, v2))