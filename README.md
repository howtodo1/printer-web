# PenPrint 
PenPrint is a tool that allows you to create vector art and easily convert that art into instructions that a 3D printer could use to draw it!
> **Note:** the settings are fixed for a 100mmx100mm 3D printer. The base size will be adjustable in the future

Here is a list of what each of the buttons do:
- **Preview image:** This shows how the image would look like if it was drawn using pen strokes. This is useful since the editor version of the image displays additional detail that would be stripped away when we convert it into pen strokes.
- **Generate GCODE:** This downloads the gcode file for use with the 3D printer. Running the gcode on the printer should make the nozzle follow the vector art you made
- **Send to me!:** If you do not have a 3D printer, but you want to see your vector art in drawing form, you have the option to send it to me. If I think the art is cool, I might print it and add it to the website :)

## How to use the tool

For every object you want to add:
1. Add an object by clicking the **text** or **icon** buttons at the top of the canvas
2. Modify the text/icon by using the prompt at the left of the screen
3. Move/scale the object

Do this enough times and your objects will come together to make something cool!

## 3D printer setup

If you are going to use your own 3D printer to print the art, you need to mount a pen to the side of the nozzle and check which Z levels should be classified as "pen up" or "pen down". Once you know what the z levels are, you can change the **GCODE UP**, **GCODE DOWN**, and **SPEED** values as appropriate for your 3D printer.
