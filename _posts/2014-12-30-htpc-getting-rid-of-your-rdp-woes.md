---
layout: post
title: 'HTPC: Getting rid of your RDP Woes'
date: 2014-12-30 15:02:00
cover: http://cdn.thuriot.be/Covers/NESRemote.png
categories: [RDP, HTPC, Without Lock, Windows, Disconnect]
---

Last year, I finally decided to get a HTPC hooked up to my TV set (running Windows 8.1). While it has been a major improvement on my TV experience, it has caused some extra woes as well.

Due to the machine's nature, I refuse to hook up a keyboard and mouse. Even a wireless one! The only thing I've hooked up, is an IR receiver and I want to keep it this way. Now and then, the machine requires a little bit of maintenance. I like RDP'ing into the machine and manage it remotely. I prefer RDP since it is built in. I don't want to install yet another VNC service on a machine I want to keep as clean and lightweight as possible. 

_I do realize that installing a Linux distro would make it even more lightweight, but I'm currently running a few Windows-only services on it. (I am a .NET developer, after all!)_

RDP, all in all, works great. It does what it's supposed to do and I hardly have to configure anything to make it work. There is only one downside and sadly, it's a rather big one. When RDP'ing into the machine, it auto locks. This is something I can live with, as that also means no one is watching my actions through my TV while I'm working on the machine. However, after closing the connection, the machine remains locked. This is a major pain in the ass as it means I'll have to either reboot the machine (auto-login) or type in my password.... Only there is no keyboard attached.

After reading up a bit and tinkering a lot, I've come up with a rather decent solution.

# Disconnecting through a Task

First, we'll start by creating a new task. We'll be creating the task to simplify running an elevated command.
Open the `Task Scheduler` by pressing the `Win+R` buttons and executing the following command.

```
Taskschd.msc
```

After the window opens, right-click the `Task Scheduler Library`, create a new task and name it `Disconnect`.

![Create New Task - General Tab](http://cdn.thuriot.be/HTPC-RDP/1.New.jpg)

Don't forget to tick `Run with highest privileges`. This will allow the task to run with administrative rights without triggering [UAC](https://en.wikipedia.org/wiki/User_Account_Control). I like having UAC on, but it gets annoying fast for tasks like these. Without administrative rights, it will not work. 

After doing so, go to the actions tab.

![Actions Tab](http://cdn.thuriot.be/HTPC-RDP/2.Actions.jpg)

Click `New` and create a new action. The following window opens.

![Add Action](http://cdn.thuriot.be/HTPC-RDP/3.Action.jpg)

The command we will be executing is the following:

```
powershell -Command "tscon (qwinsta | ForEach-Object { $_.Trim() -replace '\s+',',' } | ConvertFrom-Csv | Where-Object { $_.SESSIONNAME -match '^>' } | Select-Object -First 1 -expand ID) /dest:console"
```

Enter it into the window as shown in the screenshot.

Lastly, go to the settings tab. Make sure `Allow task to be run on demand` is ticked.

![Settings Tab](http://cdn.thuriot.be/HTPC-RDP/4.Settings.jpg)

# A word of explanation: What exactly is happening?

We're basically running the `qwinsta` command. This will give us a list of all sessions running on the machine. The current sessions that we are in, will be marked with a `>`, so we're filtering that line out. After selecting that line, we want to retrieve the `ID` column. This is the ID of the current session.

After getting the ID, we run the `tscon` command and pass the id and tell it to connect to `console`. This will make it drop the RDP connection and connect to its physical console. 

We have now disconnected the RDP connection and left the machine running unlocked. No keyboard required to watch some TV!

# Rounding up

## Starting the task
This task can easily be run with the following command:
_Note that `Disconnect` is the name of the task we just created._

```
schtasks /run /tn "Disconnect"
```

## Simplify, beautify

We can use [OblyTile](http://forum.xda-developers.com/showthread.php?t=1899865) to create a Windows 8 tile that will run this command. Then all we have to do is click the tile and we're disconnect, ready to watch some TV without further interaction.

That's it, enjoy your HTPC!