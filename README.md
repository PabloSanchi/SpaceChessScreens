[![github-languages-image](https://img.shields.io/github/languages/top/PabloSanchi/SpaceChessScreens.svg?color=red)]()
[![github-language-count-image](https://img.shields.io/github/languages/count/PabloSanchi/SpaceChessScreens.svg)]()
[![Issues](https://img.shields.io/github/issues/PabloSanchi/SpaceChessScreens.svg)](https://github.com/PabloSanchi/SpaceChessScreens/issues)
[![github-repo-size-image](https://img.shields.io/github/repo-size/PabloSanchi/SpaceChessScreens.svg?color=yellow)]()

# IMPORTANT NOTE
This is only a brief description and installation guide.<br>
[Full project documentation here!](./assets/Documentation.pdf)

# 🚀 SPACE CHESS

A Newspace related visualization project in collaboration with Hydra-Space.    
The basic idea is to use the Liquid Galaxy cluster as a visualizer of a world chess game that will happen with people around the world and through satellite communications, a world&apos;s first !!!

Two teams, the Earth (🌎)(you) and the Space (🛰️) (a strong AI) <br/>
Every day the Earth makes one move (at least), the most common move among you all, so play as a community and
not as an individual.

Once the Earth has made the move, wait for the Space.
The satellite may take a while to make its move, so you may not see it in hours, be patient.

<p align="center">
<img src="./assets/Spl.png" width="70%">
</p>


## <a name="req" ></a>✏️ Requirements

1. Make sure the Liquid Galaxy core is installed. Check out the git hub [repository](https://github.com/LiquidGalaxyLAB/liquid-galaxy)
2. Make sure **Node.js version 16** is installed on the master machine by running:
```bash
node -v
```
-  The output should look something like `v16.*.*`, at least you need version `v14.*.*`, if this is not the case it may not work, if not, try upgrading to version 16.

1. Install pm2 on the master machine. Run command:
```bash
sudo npm i -g pm2
```
4. Make sure Chromium Browser is installed on all machines.


## 🖥️ Installation & Launch

### Install Space Chess
- Open a new terminal and go to the '~' (default) directory with the command:
```bash
cd ~
```

- clone the repository **in the current directory (default directory on the terminal)** of the **master** machine with the command:
```bash
git clone https://github.com/PabloSanchi/SpaceChessScreens
```

- Go to the new folder (GitHub repository) and execute the installation script.
Use the following commands **(you will have to restart your computer after the installation is done):**
```bash
cd SpaceChessScreens
bash install.sh
```

- Now execute the following command:

  - ```bash
    ssh -o TCPKeepAlive=yes -R 80:localhost:8120 nokey@localhost.run
    ```
  - You must enter `yes` when asked `Are you sure you want to continue connecting (yes/no)?`

- <a name="env" ></a> Ask the owners for the `.env` file, otherwise the connection throughout the IP wont work.

- INSTALLATION FINISHED!

### Launch Space Chess

You must be in the repository directory, 
Your terminal must look something like this: ` SpaceChessScreens $`

- Execute the launch script, by doing the following:
```bash
bash open-chess.sh NUMSCREEN
```

***WARNING ⚠️:
NUMSCREEN is the number of screens that you want to use.***

***The deafult value is 5. Make sure to set it properly according to your rig setup.***


## 🆘 Troubleshooting

[1.0] Installation errors<br/>
[2.0] Launch errors<br/>
[3.0] Connecting issues

### Solution
[1.0]
If something went wrong during the installation, the main cause is that you do not satisfy the requirements. Please make sure to check the [requirement area](#req).

[2.0]
If you are experiencing some errors while executing the `open-chess.sh` script, kill it and restart it.
- Stop the server
  - Kill all related running terminals
- `bash kill-chess.sh`
  - You must be in the SpaceChessScreens folder
- `ssh open-chess.sh NUMSCREEN`
  - You must be in the SpaceChessScreens folder

[3.0]
If you cannot connect using the rig modal on the web, [renember to ask the owners for the `.env` file](#env)


## Keyboard Controls (test only)
- ZOOM: **w** & **s** keyboard keys
- AXIS Movement: **a** & **d** keyboard keys

## Web Controller (test only)
Type on your browser the following url<br/>
- MASTERIP:port/controller
  
Example:
```bash
http://192.168.0.11:8120/controller
```


<p align="center">
<img src="./assets/controller.png" width="35%">
</p>


## 📺 Final view (3 Screen example)
<p align="center">
<img src="./assets/finalview.png" width="100%">
</p>

