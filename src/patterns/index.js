import period52GliderGun from "./period52glidergun.js"
import turingMachine from "./turingmachine.js"
import universalTuringMachine from "./universalturingmachine.js"

let fromPlaintext = str => () => {
  let lines = [...str.match(/^[.O]+/mg)]
    .map((line, y) =>
      line
        .split("")
        .map((char, index) => char === "O" && [index, y])
        .filter(Boolean))

  return [].concat(...lines)
}

let fromRLE = str => () => {
  let bodyMatch = str.toLowerCase().match(/^(?:#.*?\n)*(?:\s*x.*\n)([ob$\d\n\s]*)/i)
  if (!bodyMatch) throw Error("RLE body not found in string: " + str)

  let lines = bodyMatch[1].split("$")

  let livePairs = []
    , y = 0

  lines.forEach(line => {
    let runs = line.match(/\d*[bo]/g)
      , x = 0

    for (var run of runs) {
      let count = parseInt(run) || 1

      if (run.includes("o")) {
        for (let i = 0; i < count; i++) {
          livePairs.push([x, y])
          x++
        }
      } else x += count
    }

    let trailing = parseInt(line.match(/\d*$/)[0]) || 1
    y += trailing
  })

  return livePairs
}

export default [
  {name: "Empty grid", locations: () => []},
  {name: "Glider", locations: () => [[0,2], [1,2], [2,2], [2,1], [1,0]]},
  {name: "R-pentomino", locations: () => [[1,0], [0,1], [1,1], [1,2], [2,2]]},
  {name: "Diehard", locations: () => [[1,0], [5,0], [6,0], [7,0], [0,1], [1,1], [6,2]]},
  {name: "Acorn", locations: () => [[0,0], [1,0], [4,0], [5,0], [6,0], [3,1], [1,2]]},
  {
    name: "Unix",
    locations: fromPlaintext(
`.OO
.OO
.
.O
O.O
O..O..OO
....O.OO
..OO`)
  },
  {
    name: "Gosper glider gun",
    locations: fromPlaintext(`
........................O........... 
......................O.O........... 
............OO......OO............OO 
...........O...O....OO............OO 
OO........O.....O...OO.............. 
OO........O...O.OO....O.O........... 
..........O.....O.......O........... 
...........O...O.................... 
............OO......................`)
  },
  {
    name: "Bi-gun",
    locations: fromPlaintext(`
...........O
..........OO
.........OO
..........OO..OO
......................................O
......................................OO........OO
.......................................OO.......OO
..........OO..OO..................OO..OO
OO.......OO
OO........OO
...........O
..................................OO..OO
.......................................OO
......................................OO
......................................O`)
  },
  {
    name: "Max",
    locations: fromPlaintext(`
..................O
.................OOO
............OOO....OO
...........O..OOO..O.OO
..........O...O.O..O.O
..........O....O.O.O.O.OO
............O....O.O...OO
OOOO.....O.O....O...O.OOO
O...OO.O.OOO.OO.........OO
O.....OO.....O
.O..OO.O..O..O.OO
.......O.O.O.O.O.O.....OOOO
.O..OO.O..O..O..OO.O.OO...O
O.....OO...O.O.O...OO.....O
O...OO.O.OO..O..O..O.OO..O
OOOO.....O.O.O.O.O.O
..........OO.O..O..O.OO..O
.............O.....OO.....O
.OO.........OO.OOO.O.OO...O
..OOO.O...O....O.O.....OOOO
..OO...O.O....O
..OO.O.O.O.O....O
.....O.O..O.O...O
....OO.O..OOO..O
......OO....OOO
.......OOO
........O`)
  },
  {
    name: "Puffer 2",
    locations: fromPlaintext(`
.OOO...........OOO
O..O..........O..O
...O....OOO......O
...O....O..O.....O
..O....O........O`)
  },
  {
    name: "Period-52 glider gun",
    locations: fromRLE(period52GliderGun)
  },
  {
    name: "Turing machine",
    locations: fromRLE(turingMachine)
  },
  {
    name: "Universal Turing machine",
    locations: fromRLE(universalTuringMachine)
  }
]