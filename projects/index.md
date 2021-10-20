---
layout: page
title: Projects
cover: //cdn.thuriot.be/images/Covers/keyboard.jpg
---

* [Administration panel running behind my previous site](/thuriot-be/)
	* Dynamic pages.
	* Dynamic menu buttons.
	* User management.
	* Blog integration.
	* Wordpress theme
		* Looks identical to the main site for seamless integration.
		* Theme specific plug-in to make button management easier. 
* [Hairstudio Admin](/hairstudio-admin)
	* Custom built administrative suite for a hairstudio
* [Bedtime AirTunes](/airtunes)
	* A Bedtime Tunes music player written in Adobe AIR.
	* Integrated sleep and wake up function.    
* [NuGet Build And Deploy](/nuget-build-and-deploy)
	* Little script to automatically create NuSpec files using reflection and build your solution into a NuGet pack.
* [Fusion (Merge Helper)](https://github.com/StevenThuriot/Fusion)
	* Tool to easily manage your changesets during merging.
	* Written for TFS 2010.
	* Proof of concept for the Saber and Nova frameworks.
* [NuGet Guidance](https://github.com/StevenThuriot/NuGet-Guidance)
	* Sometimes a NuGet package can contain complex install logic.
	* When this is the case, it can be a real hassle for a C# programmer to write all the code in powershell. This project is a hoster for any "recipe" you include in your nuget package.
	* Using MEF, the recipes will run inside this hoster project.    
* [Nova Threading](https://github.com/StevenThuriot/Nova.Threading)
	* Action Queuing system designed for the Nova project.
	* Branched into a separate repository after growing enough to be a standalone project.
	* Allows queuing through a manager on several queues.
	* A queue can be created, destroyed or blocked.
	* A blocked queue will not execute anything.
	* Queues are built on top of .NET's dataflow library.
	* Actions that belong to non-existant queues don't get executed.
	* However, they can be marked to run unqueued.
	* Metadata is easy to configure using attributes. (e.g. Blocking, Creational, ...)
	* Action implementation is decoupled from the queuing system. A WPF specific dll has already been made.
	* Available on NuGet.org and SymbolSource.org
* [HyperQube](https://github.com/StevenThuriot/HyperQube)
	* HyperQube is(/started as) an [IFTTT](https://ifttt.com) variant built on top of [PushBullet](https://pushbullet.com), created for the desktop.
	* It connects to PushBullet's websocket using the API key provided in your account settings. It filters out the messages the plugins are interested in using [Reactive Extensions](https://github.com/Reactive-Extensions).
	* Deep down, everything is built completely modular so each part is easy to replace by another component (loaded by MEF). (e.g. input can easily be replaced by another UI, in WPF, WinForms, ...) By default, everything is built with an eye on maximum compatibility. ( .NET / Mono )    
* [HyperQube Plugins](https://github.com/StevenThuriot/HyperQube-Plugins)
	* HyperQube Plugin Repo.
	* Currently contains an extended sample to forward push messages to XBMC, showing how to build a HyperQube plugin.    
* [HyperDrive](https://github.com/StevenThuriot/HyperDrive)
	* HyperDrive is a 10 minute image hosting service built on top of NodeJS.
	* Built for the HyperQube XBMC plugin. Notification images are sent as base64 but XBMC expects a URI. HyperIcon makes this translation on the fly.
* [Express Rate Limiter](https://github.com/StevenThuriot/express-rate-limiter) and its [Redis](https://github.com/StevenThuriot/express-rate-limiter-redis) variant
	* Written for usage with the expressjs framework.
    * Rate limit server calls using inner and outer limits.
    * Either in memory or by using a Redis server.
    * Easy to implement another cache solution.
* [Random Octocat](https://github.com/StevenThuriot/Random-Octocat)
	* Image service which can be used to display a random Octocat.
    * Praise Octocat!
* [Awaitable](https://github.com/StevenThuriot/Awaitable)
	* Awaitable is a Framework around async/await, letting you use it without having it spread like a virus.
* [Snapshot](https://github.com/StevenThuriot/Snapshot)
	* Snapshot an instance in time to maintain its state.
* [NGINX BuildPack](https://github.com/StevenThuriot/heroku-buildpack-nginx) and its [builder](https://github.com/StevenThuriot/heroku-nginx-builder)
	* `NGINX` Buildpack for [Heroku](http://www.heroku.com).
* [node-fs-walker](https://github.com/StevenThuriot/node-fs-walker)
	* `NodeJS` Module.
	* Recursively walk through the filesystem, searching for files and directories, either async or synchronous while optionally filtering. 
* [grunt-cleanDotNet](https://github.com/StevenThuriot/grunt-cleanDotNet)
	* A grunt task that will clean up all `bin` and `obj` folders, typically found in `.NET` projects.
    * Based on `node-fs-walker`.
* [domainr](https://github.com/StevenThuriot/domainr)
	* .NET Helper to make executing a piece of code in a separate `AppDomain` easier.
* [FunctorComparer](https://github.com/StevenThuriot/FunctorComparer)
	* Takes a `Func<T, TKey>` or `Comparison<T>` and turns it into a Comparer.
* [SettingsManagement](https://github.com/StevenThuriot/SettingsManagement)
	* Flexible Typed App/Web.config Settings Management
	* Generates IL on the fly!
* [Reaper Mute Toggler](https://github.com/StevenThuriot/ReaperMuteToggler)
	* Binds to any specified hotkey and calls the Cockos Reaper API to toggle mute.
	* Hotkey can be changed in config or while running
	* API endpoint is configurable in case you don't want to toggle mute but toggle the arm-button instead
	* Lives in the system tray!
* [GitAutoCommit](https://github.com/StevenThuriot/GitAutoCommit)
	* Automatically commit changes to git on a set interval, ending with a squash merge to the original head
	* Runs as a dotnet tool!
* [Tumble](https://steventhuriot.github.io/Tumble/)
	* What do you do when NGROK is blocked at work? make your own!
	* Super simple self-hosted public urls for local dev environments.
	* Awesome multi-platform console UI thanks to [gui.cs](https://github.com/migueldeicaza/gui.cs) by [Miguel de Icaza](https://github.com/migueldeicaza) !

----------

# Forever ongoing

But also kind of archived 😔

* [Saber](https://github.com/StevenThuriot/Saber)
	* Saber is a small helper framework that allows you to focus on the main logic behind your code, rather than worry about the little things while having to reinvent the wheel over and over again.
	* Has several helpful base classes and helpers like the typical guard class, serialization helper, argument parser (e.g. static main), loads of extension methods and more...
	* Dirty tracking for your model.
	* Available as NuGet packages.
	* ...
	* The name "Saber" originates from a fictional character from "Fate/stay night".
	* In Fate/stay night, she is Shirō Emiya's servant. An agile and powerful warrior. Saber is loyal, independent, and reserved; she appears cold, but is actually suppressing her emotions to focus on her goals. Her class is considered the "Most Outstanding", with excellent ratings in all categories.
* [Nova](https://github.com/StevenThuriot/Nova)
	* Graphical framework containing several controls, themes and other graphical aids so you can quickly start a new project without having to reinvent the same graphical logic over and over.
	* Integrates an MVVM layer to make your work easier without having to set anything up.
	* Allows graphical validation of controls.
	* Allows the usage of asynchronous actions where you don't have to worry about a thing, the framework will take care of it.
	* Easily customizable for your project. All resources are present in the resource dictionary and can be overwritten by the project using the framework.
	* Most controls are themed.
	* Allows graphical validation of controls.
	* Allows the usage of Watermarks.
	* Built-in costumizable exception handling for uncatched exceptions.
	* ...
* [TVDB NFO Creator](https://github.com/StevenThuriot/TVDB-NFO-Creator)
	* Google Chrome Extension to save TVDB pages as an NFO file which can be used for scraping in XBMC.
