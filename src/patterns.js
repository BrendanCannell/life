let fromPlaintext = str => {
  let lines = [...str.match(/^[.O]+/mg)]
    .map((line, y) =>
      line
        .split("")
        .map((char, index) => char === "O" && [index, y])
        .filter(Boolean))

  return [].concat(...lines)
}

let fromRLE = str => {
  let bodyMatch = str.toLowerCase().match(/^(?:#.*?\n)*(?:\s*x.*\n)([ob$\d\n\s]*)/i)
  if (!bodyMatch) throw Error("RLE body not found in string: " + str)

  let lines = bodyMatch[1].split("$").map(s => s.match(/\d*[bo]/g))

  let livePairs = []

  lines.forEach((runs, y) => {
    let x = 0

    for (let run of runs) {
      let count = parseInt(run) || 1

      if (run.includes("o")) {
        for (let i = 0; i < count; i++) {
          livePairs.push([x, y])
          x++
        }
      } else x += count
    }
  })

  return livePairs
}

export let
    gliderGun = fromPlaintext(`
........................O........... 
......................O.O........... 
............OO......OO............OO 
...........O...O....OO............OO 
OO........O.....O...OO.............. 
OO........O...O.OO....O.O........... 
..........O.....O.......O........... 
...........O...O.................... 
............OO......................`)
  , biGun = fromPlaintext(`
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
  , max = fromPlaintext(`
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
  , puffer2 = fromPlaintext(`
.OOO...........OOO
O..O..........O..O
...O....OOO......O
...O....O..O.....O
..O....O........O`)
  , glider = [[0,2], [1,2], [2,2], [2,1], [1,0]]
  , glider2 = [[12,4], [13,4], [14,4], [14,3], [13,2]]
  , r_pentomino = [[1,0], [0,1], [1,1], [1,2], [2,2]]
  , diehard = [[1,0], [5,0], [6,0], [7,0], [0,1], [1,1], [6,2]]
  , acorn = [[0,0], [1,0], [4,0], [5,0], [6,0], [3,1], [1,2]]
  , period52gun = fromRLE(
`#N period52gun.rle
#O Dave Greene, 2018
#C http://conwaylife.com/wiki/Period-52_glider_gun
#C http://www.conwaylife.com/patterns/period52gun.rle
x = 309, y = 298, rule = B3/S23
160b2o42b2o$82b2o77bo34bo7bo9bo$81bobo77bob2o31b3o2b2obo7b3o$75b2o4bo
68bo11bobo34bo3bo7bo$73bo2bo2b2ob4o64b3o11bob2o13b2o15bo12b2o$73b2obob
obobo2bo67bo9b2obo2bo3bo7bo9bo7b3o$76bobobobo69b2o14b2o3b3o3bobo7b3o
16b2o$76bobob2o74bo19bo2b2o7bo18bobo$77bo78b3o16bo12b2o10b2o5bo2bo$
144b2o2bo6b2o2bo6b2o8b2o22b2o6b2o$90b2o52bo2bobo4bo5bo5b2o9bo31bo$81b
2o7bo54bob2o8b2obo21b2o$63bo17b2o5bobo55bo5bo5bo2bo15b2o4bo20bo$43b2ob
2obo13b3o22b2o57b2o2bo7b2o16b2o5bo19bobo$44bobob2o16bo81bo34b2o19b2o$
42bobo20b2o79bo8bo111b2o$40b6o5bo94b2o3bo4bo109bobo$39bo9b3o31b2o67bo
107b2o4bo$35b2obob2o3bo2bo8b2o13bo9b2o69bo3bo57b2o41bo2bo2b2ob4o$35b2o
bobo5bo2bo7bo12b2o12bo69bo3bob2o9bo42b2o42b2obobobobo2bo$38bobob2ob4ob
o3b2obo13b2o5b2o81bo7bobo44bo44bobobobo$35b2obo3bobo5bo3bo2b3o4b2o13bo
66b3o10b2o9b2o89bobob2o$35bo2b2o5b5o5b2o3bo3b2o10b3o69bo4b6o2b3o98bo$
36bo4b4o12b4o15bo70bo5b2o5bo2bo$37b4ob2o3bo9bo15b2obob3o71b2o7b2o11bo
38b2o60b2o$44b6o8b3o12bobobobobo41b2o27bo19b2o17bo21bo52b2o7bo$39b2o2b
obo4bo10bo13bo6bo41bo48b2o16bobo17bobo51bo2bo4bobo$40bo3bo2b2obo5b5o
14b2o3b3o41bobo21b2o2b3o36b2o3b3o11bobo60b2o$40bob2o3b2ob2o4bo22bo45bo
bo20bo2bob2o2b2o37bo9b2o2bo54bo$39b2obo3b2obo2bo5bo20b2o46bo2b2o17bobo
4bobo38bo8b2o2bo2bo50b2o$36b2o3bob2o2bo2b3o4b2o12bo24b2o26bo2bo2b2o18b
o2bo2b2o55bo52bo$33bobo2b2o3bobob3o22b2o21b2o27bo26b2obobo55bo15b2o$
32bob2o2bob2o8bo20b2o14b2o8bo27bo26bobobobo25bo28b3o11b2o$32bo11bob2o
2bo37bo33b3o26bo2b2obobo22bobo22bo7bo13bo$25b2o3b2o2b2o3b3o6bob2o36bob
2o30bo10b3o15b2o4bobo23b2o21bobo54b2o$26bo2bo2b2obo2bobob2obo2bo2bo28b
2o4b3o2bo43bo21b2o47bo2bo44bo9bo26b2o$25bo3bobo7bo2bob2o3b2o29b2o3bo3b
2o38b2o3bo72b2o17b2o13bo10b2o7b3o27bo$24bob3obob2obo3bo6bo38b4o40bo31b
o39bo16b2o5bobo13b3o9b2o6bo26b2obo$22bo2bo2bobobob2o7b4o24b2o15bo40b3o
27b2o17bo22b2o15bobo4bo18bo40bo4bo$22b2obo7bo2bo8b2o23bobo12b3o72b2o
16bobo19bobo8b2o7bo2b2ob4o13b2o39bo4bo$25b2o2b2o2bobobo3bo28bo13bo40b
2o51b2o31bobo5b2obo3bo2bo54bo3b3o$22b2o2bo3b3o2b3o2bobo26b2o14b5o34bob
o86bo6bob4o52b2o5bo4b2o$22bo3b2ob2o3b4o3b2o2b2o29bo12bo34bo88b2o5bobob
o52b2o11bo$23b3obo2b4o11b2o27b2o11bo21b2o12b2o96bo57bo11b3o$25bo2b2o3b
obo39b2o10b2o19b2o32bo66b2o14bo14b2o51bo$bo2bo3b2ob2o13b2o2b2o2b2o74bo
30b2o54bo10bobo16bo6b2o5b2o2bo38b3o$b4o2bobobobo14bobo12b2o96bobo51bob
o10bo16bobo6bo7b4o7b2o29bobo$5b3o3bo2bo13bobo11b2o152b2o9b2o16b2o5bobo
8b2o8bobo29b2o$b4o4b2obobo14bo14bo187b2o9b2obo8bo$bo4b3o3bob2o191b4ob
2o5bo25b3o7b2o$3bob2obo3bo2bo132bo39bo18bo2bobo6bobo23bobo41b2o$2b2ob
2obobo2b2o131b2o17bo22b2o19bo2bo6b2o21b2obo43bobo$bo2bo3b5o134b2o16bob
o19bobo20b2o29bob4o28b3o13bo$2bo9bo152b2o74bobobob2o28bo13b2o$3bobo2b
4o226b2obobobo4bo25bo$7bobo20bo32bo138bo3bo15b2o14bo2bo2b2ob4o$3bo3bo
2b2o18bobo28b2o31bo2b2o23b2o6bo71bo4bo15bo7b2o7b2o4bo$3bo7bo18b2o30b2o
30b4obo6bo14b2o7b3o22bo46bo4bo12b3o8bobo12bobo$2b3ob2o2bo3b2o83bo5bobo
15bo9bo20b2o46bo17bo10bo15b2o$6b3obobo2bo40b2o36b2ob2ob2o3bobo4b2o18b
2o20bobo29b2o15bobo$4b2o4bob2o41b2o36bo2bo3bo3b2o2b2o2bo74b2o15bo$2o2b
2o2bobobo44bo34bobo2b2o3bo3bobobobo73bo67b2o$o2bo6bo3bob2o73bobob2obob
ob2ob2o2bobo38b2o6b3o45bo48bo$b4obob2ob4obo74bobo3bo10b3o24bo13bo2bo4b
o17bo30bobo44bo$6bo4bo4bo75bo2bo4b6o3bo23b2o22bo2bo14b2o29b2o45b5o6b3o
5b2o$b2o5b3o2b3o77b2ob2o7b3o26bo23b2o14bobo81bo4bo8bo$2b3obo4bobo81b2o
3b6o2bo33b2o4bo2bo52bo9b2o39b3o5bo2bo3bobo$bo2b8o81b2ob2ob2o5b2o26bo2b
o4bobo3bob2o9b2o40b2o9bo39bo6b2o3bo3b2o$bo4b2obo2bo4bo32bo43bo3bo2bob
2o7bo22b2o7bo4bob3o7bo41bobo6bobo39b4o2bo4bo$11b2o4bobo28b2o43bo2bob2o
2bo7b3o31bob3o3bobo7b3o47b2o30b2o6b2o3bo2bo3bobo$b2ob3o10b2o30b2o42b3o
5bob2obo2bo33b2obo7bo9bo62bo16bobo4bo2b3o3bo4bo$4b2o78bo11b2ob2obo7bo
20bo22b2o50b4o16bobo15bo6b2obo6b2o4bo$bo29bo37b2o7b2o3bobo7b2o2b2o3b3o
2b3o2bo17bobob2o37b2o30b3o2bo15bobo25bo8bo3bo$obo28b3o34b2o9bo3bo2bo4b
o2bob2o2bobo7b3o17bobobobo37b2o29bo3bo10b2o3b2ob2o24b2o7bo3bo$b2o31bo
35bo8bob2ob2o5b2obo3bo5bo3b2o17b2obobobobo2bo33bo32bo2bo10b2o2bo4bo34b
3o$6bo26b2o45bobo11bo5b2ob3o3bob2o14bo2bo2b2ob4o66b3o16b3o$5b2o75bo5bo
5bob2o2b4o3b3o2bo16b2o4bo26bo51b2o2b7o2b2o6bobobo3b2o17b2o$4bo2bo75bob
obobo3b2o2bo3b2o2bo2bobo24bobo24b2o50bo2bobo5bo8bob3obobobo18bo9b3o$5b
2o15b2ob2o57bo3bo3bo2bo6b2ob2o3b2o24b2o23bobo52b2o2bo3bob2obo4bo5bobo
17b3o10bo$9bobo10b2obo61b2o4b2ob4o4bo7bo106bo4bobo2b2o2b2ob2obobob4o
13bo13bo$10b2o13bo58b5obo4bo2bo2bob5o2b2o107bo4bobo2bo6bob2o3bo2bo$10b
o14b3o4b2o3bo46b2obo3bo3bo2bobob8obobo97b2o6bobo3b2o2b2obobo5b2o3bo$
23b2o3bo3b2ob2o50bo2bo3b2obo4bo9b2o5b2o74b2o14b2o7b3obo6bobo3b2o3bo14b
2o$22bo2b4o7b2o50bo5bo2bobo19bobo74bo24b5o2b3obo4bo4bo2b3ob2o6bobo$6b
2o14b2obo15b2o47bo5bobob3obob2o8b2obobo71b3o26b2obobob2ob2o3bo4b3o2b2o
bo6bo$7b2o14bo2b3o12bobo18b2o18b2o5bo5b2obob2o9b2o3bobobo39b2o31bo38bo
2b2ob2ob2o$7bobo13bo5bo13bo17bobo7b2o8b2o6bo7b2obo2b2o3bo2b2o5bo42b2o
69b2o7bo$8b2o14b5o14b2o6bo9bo10bob2o7bo13bo10bo8bo2bo9b2o28bo59b4o9bob
5obobo$6b2obobo14bo23bobo5b2obo10bob2o19b2obo2b3o3bo9bo7b2o2bo2bo87bo
3bo2b2o3bo2bo4bobobo$7bo3b3o36bobo5b2obobobo4b4o16bo5bobob3ob2o5b2o4bo
3bo3bo4b3o16bo59b2o8bo4bo2b2o3b3o2bo2bo3bo$12b2o35b2ob3o6bobo2b2o2b2o
2bobo12bobo4bobo5b2o5b2o4bo9b3o19b2o70b3o11b2obob4o8bo2bo30b3o17b2o$8b
o3bo42bo5bo2bo2b2o5b3o12bo2bo4b2obo3b2o11bo6bo5bo17bobo48b2o8b2o19b3o
2bo2bo5b3o3b3o2b3o28bo19bo$7bobob2o9bobo26b4o7bobob3o5b3o13b2o7bo4b2o
12bobo3bo3b3o69bo23bo2bobo3bobob2ob4o3bobo3b2o3bo28bo16bobo$8bo3bo2bo
7b2o17bo6b2obo8b2ob2obo6b3o22bob5o14bo5bo73bobo7bobo9bo7bobobo2bo2bo4b
3ob4o2b3obo43bobo$12bo3bo6bo19b2o23bobo4bo24bo20b4o3b2obo69b2o8bo14b3o
7bobo3bo5bo4b2o4bo39b2o2bo$11b2ob2obo24b2o3b2o20b2o23b2o5bo20b5obob2o
55bo23bo9bo2bob3obobobo5bob4obo2bo3b2o2bo11b2o27b2o2bo2bo$10bo2bo3bo
21bo41b3o10bobob3o26bo58bobo30b3ob2o4bob2ob4obo7bo2bobo2bobo12bobo33bo
$11bo3b2o20b3o43bo12bobo17bo7bobo59bobo29bo4bo5bobo3bobob2o12b2o2bobo
10bo34bo$12b3o21bo15b2o28bo6bo6b2o16bobo7b2o6bo14b2o36b2ob2o3b2o23b9ob
o2bob2o3bo15bobob2o46b3o$14bo21b2o14b2o35b3o23b2o13b3o15b2o35bo4bo2b2o
31bobobo2bo5b2o3bo4b2o3bobo43bo7bo$53b3o36bo36bo17bo39b3o21bo8b2obo2bo
bob2obo2b3o2bobobo3bo2bobobo7bo33bo2b2o$53bo37b2o36b2o39b2o3bobobo6b2o
2b7o2b2o10b2o6bo4b2o2bo4bobo4bob2obo5b3o2bobo4bobo32b2o$34b2o18bo2b2o
44b3o30bo33bobobob3obo4bo3bo7bo2bo8bo2b3o5bo3bo2b2o4bobob2obo4bob4o5bo
b3o2bo2bo$33bo2bo18bo9bobo37bo9b3o18b2o34bobo5bo6b2obob2o3b2o10b4ob2o
4bobo3b2o5bobobobob4obo4b5obo3bob2obo2bo$33bobo18b2o8bo2bo36b2o9bo4bo
14bobo30b4obobob2ob2o3b2obob5o8b2o4bobo3b2o3b2o7b2o4b2o2bobobo2bo2bo5b
o2bob2o4bobobo$33b3o17b3o4b2o3bo2bob2o44bo3b2o46bo2bo3b2obo4bobobo5b3o
6b3o17bob2o3b2o2bobo6bob3obo2b2o2bob2o2b2o3bo2bo34b2o$26b2o17bob2o12b
2o5bo2bo49b2o46bobo2bo3bob2obo2bobobo4bo6bo2bo6bobo6bo2b3o3bo2bo3bo4bo
b2o3bobo2b2o3b2o5bo37bobo$25bobo15b3obo12bo8b2o16bo30bo2bo48b3ob2ob3o
6b2o2bo3bo7b2obo7bo7bo2bo4b3o2bob3o2b2obob2o4bo2bob2o2b5o40bo$25bo16bo
4bobo19b2o17b2o11bo17b2o43b2ob3o2bob2o2b2obob4o3b4o9b2o7bo8bo2b2o2b2o
3b2ob2ob3o2b2o3bo3b2o3bo2bo21b2o21b2o$24b2o16b2o3b2obo38b2o10b2o29b3o
29bob2o3bo2b2o3bobo6bo36bo2bobo2bo3bo2b2o3bobo3bo3b3o5bo19bobo$50bo28b
o11bo8bo2bo31bo35bo2b2ob4o7bo38bo2bob2obobo7bob7obo6b2o19bo$38bo8b3o
16b2o11b2o5b5o10bob2o11b2o14bo2bo37bo7b2o47bobo2bobobobobob2o7bo$34b2o
bobo7bo19bo21bo11b3o13bo15bo37bobob5obo47b2ob4ob2o3b2o4b3obo$33bobobob
o24b3o7b2o26bo11b3o8b2o8bobo32bobobo4bo2bo3b2o2b2o39bo12b4o2bob2o30bo$
30bo2bobobobob2o21bo9bo39bo11bo8bo2bo31bo3bo2bo2b3o3b2o2b2o39bobo10bo
2bo36b2o$30b4ob2o2bo2bo33bo46b3o10b2o21bo2bo8b4obob2o52b2o49bobo$34bo
4b2o34b2o46bo33b3o2b3o3b3o5bo2bo2b3o17b3o9b2o9bo$32bobo39bo12bo7b2o59b
o3b2o3bobo3b4ob2obobobobob2o25bo8bobo78b2o$32b2o13b2o25bo3b2o7bobo4bob
o2bo34b2o19bob3o2bob2ob3obo2bo2bobo2bo2bob5o7bo3b2o7bobo9b2o78bo$37bo
10b2o21b2obo2b2obo6b2o5bobobobo33b2o19bobo3b2o7b2o3bo12bob3o7b2o10b2o
92bo$35b5o7bo6b2o15b2obob3o2bo11b2obob2ob3ob2o49bob2o2b3obobob2o5bo2bo
4bo4b2obo6bo6b3o76b2o14b5o$34bo5bo13bo19bob2o3bo10bo3bobob2o3b2o6bo43b
obo2bobobo6bobobo2b4obob2o4b3o10b4o77bo5b3o5bo$34bo2b3o12bobo19bo2bo3b
o4b2o3b3ob2ob2o3bobo8b2o39bobo2b2o12b2obo2bo2bobo5bo4bo7b2obo2bo76bob
2obo3bo5b3o$33b2obo15b2o18bobob2ob3o4b2o3b3o2bo2bo4b3o6b2o40b2obobo15b
o3b2obo2bob9o7b2ob2obo77bo8bo7bo$33bo2b4o31bobobo15bo4bo2bo2bo5bo49bob
o3b2o4bo3b2o5bo2bobobo16bo4bo83bo3bo3b4o$34b2o3bo3b2o24b3obo2b2obo2b2o
6b3obob3o5bobo2bo40bo7bobobo2bo3bobobo2b3o2bob2obobo2b4o10bo2bo84bobo
2bo3bo3b2o$36b3o4b2o23bo4b2obobobo5b2o2b2o2bo6b5o43bobo4bobo2b3o5bob2o
bo4bobobo2bo2b3obobo10b3o62bo18bo3bo3bo4b3o2bo$36bo32b3o2bo2bob3o4b2o
8b5ob2o2b3o39bo2bo2b3obo5b4obo4bob2obob6o5bobo76b2o18bo5bo7bob2o$33b2o
bo34b2o2bob2o2bo8b2ob3o4bo5bo3bo34bo2bob2obo3bob5o4bob4obobobobob2o2bo
4b2o76bobo19bo3bo8bo$33b2ob2o43bo7bo7b2ob2o2bo3b3o33bobobo4bo2bo2bo4bo
bobo2bo3bo3b2o5b2obo3bo44bo54b3o8b2o$53b2o23b2obo7b2o3b3ob4ob2o2bo3b2o
24bo7bo2bob2obo2bobo2b2o3bob2o3bob2o4b3o2b2o3bobo42bobo$52b2o30bob2obo
bo2bo5bo2b2o4b2o2bo21b3o10bo5b2o4b3o2bo5bo3b2o2bo2b3o2b2obo20b2o5bo18b
2o$44b2o8bo22bobob2ob2obo2bo3bob6obo3bo2bob2o20bo14b5o2b2o2bobo3b2obo
3bob2o10bo2b4o17b2o5b3o75b2o$45bo29b3obo3bo3bo5b4o5bo3b2o2bo23b2o17bo
2bo3b2o3b2o2bo3b2o3b3o4b2obobob2o27bo62b2o10bo$42b3o29bo5b4ob2ob4o7b4o
bobob3o15bo17bo6bo5b3o7bobo8bob2obo2bo33b2o61bobo11b3o$42bo32bob5obobo
2bo9bo7b2o19b2o15b3o4b2o6bob7obobo2bo2bobo4bobo2bo5bobo87bo13bo$74b2ob
o2bo2bobobo2b2ob3o2bob2o6b3o15b2o14b2o3bo12bo7b2obo2bo2bobo2bobo3bo6b
2o$75bo2bo6bo2b3o5bobobo2b3o4bo32bo2b2o7b2o4b6o4b2o3b2ob4ob2o10bo73bo
2bo$74bo2b2ob4obo6bob2obo3b5o37bobo9bo11b4o12bo40bo6bo3bo34b4o$75b2o2b
5o2b3ob2o3bobob2o5bob2o25b2o4b3o2b4o3bobo7b4o3bo10bobo38b2ob2o4b3ob2o
2bo18bo8bo$77bo6b2o2bobo3bo3bo2bobob2o28b2o3bo3b2o4bo2b2o7bo3bob2o11b
2o42b2o5bobo3bobo17b2o7b5o14b2o$75b2o3b2o4bobobo8bobo8bo29b4o2bo2bo12b
2o4bo41bo15b2o5b3o3bo17bobo12bo13bo$74bo2b4ob2obo2bob4o4b2ob2obo3b3o
15b2o15bob2o3b2o16bobo39b2o13b2o16bo7bo17b3o12bobo$66b2o6b2obo2bo5b2ob
o2b2o3bo3bo9b2o12bobo12b3o2bo5bo6bo10b2o38bo25b2o2bo2bobo4bobo16bo15b
2o$65b2o10bobobo7bobo6b3o2bob5obo13bo13bo5bo11bobo50b3o23b7o2bo4b2o16b
4o$67bo9b2o2bo7bobobo7b3o5bobo12b2o14b5o6b2o3bo2bo51bo24b2o5bobo20b2o
3bo3b2o3b2o$81b2o7b2o8bo4bob2o2b2o18bo10bo8b2o4bo84bo2b2o18bo2b3o4b2o
3bobo$82bo10b2o5bob2ob2obobo18b2o26bo2bo79bobobo20b2obo11bo$81bo8b2o5b
2obo3bobobobo19b2o28bo21bobo56bo2bo23bo$81b2o6bobob2o2bo2bobo5bob2o46b
o23b2o58b2o24b2o$89bo3bo5bobo6bo50bo23bo30b3o$88b2ob4o3b2obob3o2bob2o
94b2o8bo5bo75b2o$90bobo2bo3bobob2obobo2bo93bobo7bo4bobo22bo30b2o20bo$
90bo4b4o2bo2b3o2bo97bo13b2o15bo6b2o30bo22bo$88b2obob2o6b2o4b2o130b2o3b
obo27b3o3b2o14b5o$89bobobo2b5o2bo3bo130b2o24bo9bo6bo13bo$79b2o8bob2ob
2o5bo3bobo41bo112bobo16bobo12b3o$78b2o10bo2bo2bo2b2ob2ob2o40b2o114b2o
17b2o4b2o9bo$80bo10b2o2b2o3bo3bo43b2o137b3o6b4o$100bo3bo13bo160bo8bo2b
2o3bo3b2o$101b3ob2o9b2o159b3o11b2o4b3o2bo$105bo2bo8b2o50b3o104bo22bob
2o$99b3obobob2o55b2o2bo3bo103b2o21bo$98bo2bobobo58b2o2bob3o28b3o94b2o$
99bo5bo50b2o6b2o3b3o21b2o8bo$100b5o50bobo5b2o27bobo7bo31b2o38b2o$97b3o
49b2o4bo7b2o29bo38bo2bo3b2o9bo21bo2bo13b2o$97bo3b4o42bo2bo2b2ob4o2bobo
10b2o57bobo2bo2bo9b2o18b2ob2o13bo$98b3o3bo42b2obobobobo2bo3bo2b2o7bo
58bobo14b2o20bobo15b3o$92b2o7bo34bo13bobo3b2o2b3o3bobo7b3o87b2o6bo18bo
$91b2o7b2o32b2o14bob2obo12bo9bo61bo2bo21bobo$93bo41b2o14bo3bo4b2obo4b
2o59b2o9b2obo21bo$105bo54bob2o17bo48bo7b3obo21b2o$103b2o49b3o7b2o14bob
o44b3o7bobo3b3o$104b2o47bobobo6bo15bobo44bo9bo7bo32bo$152b2o8bobo11b2o
3bo54b2o36b2obobo$150bo2bo5bo2b2o12b2o8bob3o82bobobobo$110b2o38bo4bo3b
o25bo4bo79bo2bobobobob2o$103b2o5bobo36b2o4bo28b2obo8b2o8b2o62b4ob2o2bo
2bo$103b2o7bo45bo26bo3bo6bo3b2o4bobo55bo9bo4b2o$112b2o40bo2bo28b3o5bob
o3bo2b2obobo56b2o5bobo$155bo31bo6b2o5bobobobo56b2o6b2o$99bo23bo76b2o3b
o$98bobob2o17b2o29b2o45bo2bobobo$98bobobobo17b2o29bo27b2o15bob2o5bo$
95b2obobobobo2bo42b3o9b2o16bobo14bo2bob2o2b2o$95bo2bo2b2ob4o42bo11bobo
15bo16b2o3bo$97b2o4bo58bo16b2o$103bobo96bo$104b2o31bo54bobo5b2o9b2o$
137bobo51bo2bo7bo7bo2bo$137b2o51b2o3bo6b2o7b3o$195bo8b7o66bo$183b2o19b
5o2bo66b2o13b2o$182bobo5b3o2bo9b3o2b2o65b2o14bo$110bo71bo11b2o95bobo$
108b2o71b2o8b3o97b2o$109b2o4bo47b2o26b3o5bo13b2o21bo$115b3o31bo2bo10bo
bo9b2o20b2ob2o3b2o2b2o2bo2bo2b2ob2o2b2o6b3o$118bo24b2obo2b4o12bo9bobo
19b2ob2o3b2o2b2o3b2obo2bobo3bo6bo54bo$117b2o25bob3o4b2o3b2ob4ob2o7bo
21b2o2b2o12bob2o3bobobo4bo2bo52b2o$142bo7b2obobobobobo2bobo33bo13b2obo
3bobobo5bo3bo50b2o$124bo8b2o6bob7obo7bobob2obo2bo38bo4b2o3bo2bobo5b2ob
ob2o59bo$109b2o13bobo6bo5b3o3bo3bobo3b2o2bo3bo2bobo2bo36bobo2bo2bo2b2o
bobo3bob2o4b2o42bo12b3o$109bo14b2o9bo2bo3b2o3bo3b2o2b3ob2ob2o3b2o2b2o
2bo27b4o6bo3bobo8bo3b3o3bo41bobo9bo$106b2obo21b5o2b2obo2bo4b2obob2o2b
3obo2b3o4bo2bo17b2o7bo3bo3bo2bo3b5o2bobo4bobob3o42b2o10b2o$106bo2b3o4b
2o9b2obo5b2o3b2o2bobo3b2obo4bo3bo2bo3b3o2bo17b2o6bo5b2obo2bo7b2o6bobo
3bo50b3o$107b2o3bo3b2o10bobo3b2o2b2obo2b2o2bob3obo6bobo2b2o3b2obo13b3o
10b2obo2bo4bo4bo7bobobobobo52b6o$97bo11b4o15bobo4b2obo2bo5bo2bo2bobobo
2b2o4b2o7b2o10bo2bo11b2o7b3o3bo3b3o3bobobob2o54b2obo$95b2o12bo15b2obob
ob2obo3bob5o4bob4obobobobo5b2o3bobo9bo4bo8bob2o4b2o3bobobo4bo2b3obobob
o2bo54bobo$96b2o12b3o12bobo2bo2bo2b3obo5b4obo4bob2obobo4b2o2bo3bo11bo
10bobo3b3obo2bo2bo2bob2ob2obo2bo2bo2b2o56bo$113bo13bobobobo4bobo2b3o5b
ob2obo4bobo4bo2b2o4bo21bo2b2o3b2o3b3obo3b3obobob2o2b2o3b2o54b2o$108b5o
14bobo2bo7bobobo2bo3bobobo2b3o2bob2obobo2bob2o12b2o7b2o4b4ob3o2bobo9bo
b2o3b2obo2bo$108bo19b2o10bobo3b2o4bo3b2o5bo2bobobo17bo2bo5bo6bo7b3obob
4o2bobobob3o3bob2o$110bo12bo13b2obobo15bo3b2obo2bob9o9bo8b3o5b3o2b2o4b
o2bo2bobo2b2o4bob2obo$109b2o10bobo13bobo2b2o12b2obobo3bobo5bo4bo13bo7b
o6bo2bo2b3obo7bo5b3o2bobo$122b2o15bobo2bobo2bo7bob4ob2obo4b2ob3o12b3o
6b2o11b2o2bob6obob2obo3bobob2o27bo$138bo2b2o3bo2bob4obo5bobobob3obo2bo
40bobo4bob2obobob2obo31bobo$72b2o63bo4b2o4bo5bo3bobo7b3o23b2o6b2o13bo
3bo9bo2bo32b2o$72bobo62bob3o2b4ob3o4bo2bo2bobobo7bo4bobo12bobo5bobo9bo
6b2o9b2o$75bo2b2o58bo3b2o3bobo3b4ob2obobo3bobo2bo6b2o15bo4bo2bo5bo3bo$
73b2obo2bo4bo27b2o25b3o2b3o3b3o5bo2bo2b3o13bo15b2o4b2o6b3ob2ob2o$72bob
ob2o4b2o6b2o20bobo26bo2bo8b4obob2o40bo10bo5bo$73bo9b2o5bobo21bo4b2o31b
o3bo2bo2b3o3b2o2b2o39bo4bo$66b2o25bo16b4ob2o2bo2bo29bobobo4bo2bo3b2o2b
2o33bo5bo3bo4bo$67bo23b2obob2o12bo2bobobobob2o30bobob5obo20b3o18bobo
13bobo$67bobo17b4o3b2obo15bobobobo35bo7b2o19bo2bo18b2o6b5o2bo2bo$68b3o
14bo2bo3b2o20b2obobo16bo17b2ob2ob2o2bo18bo3bo30b2o2b2o$70b3o11bo2bo2b
3ob3o21bo15bobo9bob2o2b3o4bo3b2ob2obobob2o8b4o32b3o$70bo2bo10b2o5b2o3b
o38b2o9b2ob3o2bo4bo4bob3o2b5o8bo34bobo32bo$71b2o11b3o5b4o8b2o48bo3b2o
3bobo6bob3o18b2o23bo33bobo$76bo7b3o4bo4b3o6bo7b2o36bo3b2o5bobob2o2b2o
3bobo18b2o23b3o30b2o$76b2o6b2o5b2o2bo2bo6bobo5b2o35bo2bo3b2obo6bo2bobo
4bo17bo27bo$72bo5bo5bo11b2o8b2o42b4obobob2ob2o2b2o2bobo4bo11b2o12b2o$
63bo7bo3bobo4bobobo67bobo5bo4bob2obo3bo2b2o20bo3bo$63b3o6bo9b2obobo64b
obobob3obo8bo5bobo2bo18bo5b2o$66bo6b2o10bobo32bobo29b2o3bobobo6b2o2b7o
2b2o18bo3bo2bo$65bo2bo16b2o34b2o46b3o31b2o4bo10bo$65b4o52bo45bo4bo2b2o
31b2o8bobo$109bo57b2ob2o3b2o16bo15bo9b2o$67b2o3b2o35b2o5b2o31bo18bobo
21b2o6b2o3b2o$67bo4b2o34bobo5bo30bobo18bobo20bo2bo5bobob2o$69bo47b3o
28b2o19bo21bobo7bo3bo35bo$68b2o49bo63b2o6bo2bo10bo35bobo$182bobo6bo2bo
10b2o34b2o$83bobo10bo85bo9bobo7bo2bo$84b2o8b3o84b2o8b3o8b3obo$84bo8bo
111bo3b2o$93b2o107b2o6bo$133bobo66bob6o$134b2o97bo$134bo51b2o18b2o23bo
bo$96bo88bobo18b2o24b2o$96b2o64bo24bo$95bobo62bobo$83b2o76b2o12bo28bo
23bo$82bobo6bo81b3o27bobo22bobo$82bo7b2o80bo20bo9bobo22b2o$81b2o6b2o
81b2o18bobo7b2ob3o$91bo99b2ob2o12bo$91bo3bo89b2o4bo2bo7b2ob3o$94bobo
69b3o15bo2bo4b2o8b2obo$91bobo2bo49bobo16bo4bob2obo8bobo2bo$87bo2bobobo
bob2o47b2o16bo3bobo3bo7b2ob4o56bo$87b4ob2o2bo2bo47bo17bo4bo4bo20b3o45b
obo$91bo4b2o64b2o2b2o5b2o13b2o8bo8bo37b2o$89bobo69bobo4bo3bo15bo8bo9b
3o$89b2o70bo6bo3bo13bobo21bo$160b2o7b3o14b2o21b2o4bo$203b2o10bobo$174b
o28bobo9b2o$170b2obobo27bo$169bobobobo$166bo2bobobobob2o$166b4ob2o2bo
2bo$159bobo8bo4b2o42b2o$160b2o6bobo41b2o5bobo37bo$160bo7b2o13b3o26b2o
7bo35bobo$185bo35b2o35b2o$184bo$157bo32b2o16bo$157b3o29bo2bo14bobob2o$
144b2o7b2o5bo29bobo14bobobobo$142b3obo6bo3b2obo28b2o2b2o9b2obobobobo2b
o$141bo4bo8bo2bob2o22bo2b2o2bobo10bo2bo2b2ob4o$140bo2b3ob2o5b3obo4b2o
22b4o2bo12b2o4bo$140b3o2bo3bob2o5b5obo18b2o2bo2bobo19bobo$143bo2b2obob
ob5o2bo23bo6bo21b2o$140b4o5bo3bo4bobob2o17b3o3bo$140bo3b4obobob3obo15b
2o4bo4bobobo83bo$141b2o4bo2bobo4b2obo3bo8bo5bobob2o2bo82bobo$142bobobo
3bob2o7bo3b2o6b3o3bo2b3o86b2o$142bo4bo5bo2bob3o13b2o$140b2obo3b2obo2bo
bo2bo2b2o2b2o$141bobob2obo4bo2bobo6b2o$141bobo2bobo4bo4bobo3bobob2o$
140b2ob2o2bo8bobobobobob2obo$156b2o10bo!`)
  , unix = fromPlaintext(
`.OO
.OO
.
.O
O.O
O..O..OO
....O.OO
..OO`)