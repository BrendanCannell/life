export let RGBAToInt32 = rgba => new Int32Array(new Uint8ClampedArray(rgba).buffer)[0]