# Ceros Challenge Changes

A production deployment of my version of the challenge can be found here: https://www.allenwright.dev/ceros

## Jumping

* Jump ramps have been added to the game
* The skier can initiate a jump by either skiing over a jump ramp, or by pressing spacebar
* While the skier is in the jumping state, it will cycle through all images in the animation according to the same animation speed that the rhino's animations follow
* While in the jumping state, the skier will ignore collision from rocks and other jump ramps, but **not** trees
* While in the jumping state, the skier **cannot** initiate another jump (as this would allow infinite jumps, making only trees a threat)
* The skier can still move while jumping

## Start and Reset Buttons
* Start and reset buttons have been added to the game
* Game will not start until Start button is clicked on, at which point the start button will hide
* Reset button appears only after the skier is dead, and disappears once clicked on

## Game Speed

* Game speed has been drastically reduced (from 10 -> 1), as it felt far too fast on my local machine (tested on Chrome/Firefox) - this applies to both the skier and the rhino

## Known issues

* While not directly caused by my additions to the code, the game is prone to freezing (tested on both Chrome and Firefox)
* The hurtboxes (the box around an obstacle's image, responsible for determining a collision) seems too large - would possibly benefit from making the bounding box smaller than the image itself

## Future Improvements
* The skier utilizes very similar animation code to the rhino - this should likely become some sort of superclass or interface (as future entities will likely want to utilize animations as well)
