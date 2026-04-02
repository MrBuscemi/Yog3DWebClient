UPDATE April 2nd, 2026 - Added the Runechat fix that I made for my April Fools video with help from Claude Code. Wanted to be honest about it being added to the project. I ran out of time to do it myself to finish before April Fools. TextToSpeak will be added next as Claude also helped me with that. Fixing all the bugs still on it. Poly has a british accent and won't stop cursing on comms.
________________________________________________________________________
UPDATE March 31st, 2026 - Added v1 of Right Click menu for webclient (basic verbs only -Examine, pick up, Pull, point, use)
________________________________________________________________________
UPDATE March 28th, 2026 - Added Radiation overlay to FLOOR_PLANE to radiation storms pr radiation waves. Now shows plasma gas on floor textures as radiation visuals in 3D. Workaround for VIS_CONTENTS not workable in 3D
________________________________________________________________________
FIX ADDED: Sorry for those that downloaded before I fixed a missing a file that was not uploaded. If your build fails for not haing a changlog.html, then go over to the HTML folder in the main repo here and download the changelog.html file to add to yours. That was my bad.
________________________________________________________________________
Hello!

I am not the creator of the Yogstation 3D/Space Station 13 3D. That is all Monster860 who built it before the project got shut down a few years ago. I am just attempting to fix up what is possible so that anyone can try out this whenever they want. 

I will later be adding more tips and guides for stuff here to help anyone who wants to try it. A lot of stuff can be done in the admin panels that are unlocked for you to play with.



                                                        Controls
W,A,S,D =  movement

TAB = Switch between mouse and camera movement modes

V = Switch between 1st and 3rd Person modes

1,2,3,4 = COMBAT INTENTS


CTRL + LEFT CLICK = Grab whatever is selected

Right Click = Only basic verbs for now (Examine, pick up, Pull, point, use) - it has to be completely rebuilt as a TGUI menu. v1 only has these

ALT + LEFT CLICK =  Shows all items on a spot in top right of screen. A workaround for picking things up somewhere that has multiple things layered on top of each other.


F11 - use this in browser to go full screen
F12 - UI toggle to make the screen less cluttered

                                                        TO RUN OFFLINE
STEP 1:  DOWNGRADE BYOND

This can not run on the current version of Byond. You will need to downgrade to Byond 514.1589. Here is a link to Byond where you can download that exact version
www.byond.com/download/build/514/514.1589_byond.exe

STEP 2: Download the Repo

Download a Zip of this github repo and extract the contents to where you want the game files to go


STEP 3: Build the Project

In the main directory of the folder, find Build.Bat and run it. 
Make sure you downgrade your Byond beforehand or else it will fail. 
  When it finishes, click any key to have it close down. 
  Yogstation.dmb will now be at the bottom of that folder.


STEP 4: Host the Server

Right click on Yogstation.dmb and click HOST from drop menu. Click the icon from your taskbar on the bottom to open up the program (it might take a few clicks). 
  Make sure webclient is toggled on. Copy down the 5-digit number in the bottom left "Port" section.


STEP 5: Configure the WebClient Proxy

Open the WebClient folder from the root folder. Open the "Config.Example.json" file in notepad. At the bottom, change the "Byond_addr" 5-digit address at the end of the line to the 5-digit you copied from the "port" in previous step.
  Save the file and close it.


STEP 6: Start the WebClient Proxy

Copy this ".\tools\build\build.bat run-webclient-proxy" and then at the root folder of the 3D client, Shift + Right Click anywhere & open a "PowerShell Window". Paste the line & hit enter. Keep this running while you are running the game.

STEP 7: Connect

In any browser open http://localhost:18234/ and the game should be running. Currently you will have to redo your character after each round.

STEP 8: After Each Round

This step is just to mention that after each round the game will crash. You will then have to go add the new 5-digit numeral to the JSON file again. That is all.

