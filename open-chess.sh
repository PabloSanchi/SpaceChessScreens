#!/bin/bash
. ${HOME}/etc/shell.conf

auxVar=( $LG_FRAMES )
len=${#auxVar[@]}
gnome-terminal -- npm start ${len} $1

sleep 5

port=8120;
screenNumber=0;
for lg in $LG_FRAMES ; do
    screenNumber=${lg:2}
	if [ $lg == "lg1" ]; then
        ssh -Xnf lg@$lg " export DISPLAY=:0 ; chromium-browser http://localhost:$port/$screenNumber --start-fullscreen --autoplay-policy=no-user-gesture-required </dev/null >/dev/null 2>&1 &" || true
	else
        ssh -Xnf lg@$lg " export DISPLAY=:0 ; chromium-browser http://lg1:$port/$screenNumber --start-fullscreen </dev/null >/dev/null 2>&1 &" || true
	fi

   sleep 3
done