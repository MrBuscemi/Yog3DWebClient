Hello!

I am not the creator of the Yogstation 3D/Space Station 13 3D. That is all Monster860 who built it before the project got shut down a few years ago. I am just attempting to fix up what is possible so that anyone can try out this whenever they want. 

I will be adding more and more tips and guides for stuff here to help anyone who wants to try it. A lot of stuff can be done in the admin panels that are unlocked for you to play with.



                                                        Controls
W,A,S,D =  movement
TAB = Switch between mouse and camera movement modes
V = Switch between 1st and 3rd Pprson modes
1,2,3,4 = COMBAT INTENTS

CTRL = LEFT CLICK = Grab whatever is selected

RIGHT CLICK DOES NOT WORK YET = yeah this part sucks. Major thing that needs to be worked on somehow. Below is workaround
ALT + LEFT CLICK =  Shows all items on a spot in top right of screen. A workaround for picking things up somewhere that has multiple things layered on top of each other.



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

