---
layout: post
title: NuGet as a plugin deployment platform
date: 2013-12-18 20:39:00
categories: [NuGet, Deployment]
---

[NuGet](http://www.nuget.org/) has become quite popular among .NET developers. As described in one of my earlier posts, it is an amazing tool to manage external dependencies.

It's not just a mere dependency manager, though. No, it is so much more! The [NuGet core framework](http://www.nuget.org/packages/Nuget.Core/) is available as NuGet package itself. This Core Framework allows you to use NuGet's packaging abilities together with it's deployment strategy to basically do whatever you want.

One of the possibilities is plugin deployment. In this post, I will explain how to do this. But first, I will explain how I got to investigating this technology.


#Background info
I'm currently working on a project that quickly allows you to build modules. These modules are then loaded by a hoster shell through MEF and automagically turned into a navigational tree.

Spreading the modules with the hoster can quickly become quite the hassle. Most commonly, this would be done through a clickonce solution. The problem with this, however, is that the clickonce package can quickly become quite large and may contain other modules that do not interest our user.

By (ab)using NuGet, we can let the user browse through a gallery and let them pick out the modules they want to use. When a new version of a certain module is released, the user can simply update that one single module, instead of having to download the entire clickonce package again.

#The code
And now, finally, comes the interesting part. The code!

First, we select a location to save our plugins. The easiest way to do this, is by using a common folder in the location of our entry assembly (the hoster executable).

```csharp
    var entryAssembly = Assembly.GetEntryAssembly();
    var location = entryAssembly.Location;
    var pluginDirectory = new FileInfo(location).Directory;
    var pluginFolder = Path.Combine(pluginDirectory.FullName, "Modules");
```


Now that we know where we're going to save our packages, we can intialize our repository. This can be done in a single line of code.

```csharp
    var repository = PackageRepositoryFactory.Default.CreateRepository(@"http://novamodules.apphb.com/nuget");
```


We will now query the repository to retrieve the packages. Usually, we are only interested in the latest packages.

```csharp
    var plugins = repository.GetPackages().Where(x => x.IsLatestVersion).ToList();
```


This list of plugins can then be shown to our user, who can then select which plugins to install or update.
Installing the plugins themselves, can also be done in only a few lines of code.

First we create a package manager. Using this manager, we can then install, update or uninstall the packages of our choice.

```csharp
    var manager = new PackageManager(repository, pluginFolder);

    foreach (var plugin in plugins)
        manager.InstallPackage(plugin, false, true);
```


Uninstalling the packages can be tricky, however, since .NET will most likely be using them. A way around this, is by loading them into a different appdomain with ShadowCopy enabled. This can, however, quickly become quite difficult. An easier solution would be to simply move the package into another folder and simply clean up that folder every time your application starts.

The packages can now easily be loaded up as plugins using MEF's [DirectoryCatalog](http://msdn.microsoft.com/en-us/library/system.componentmodel.composition.hosting.directorycatalog.aspx). Because of the way NuGet installs packages, the easiest way to retrieve the plugins is by retrieving all the "lib" folders in our Modules directory and creating an aggregate of DirectoryCatalogs.


```csharp
    var catalogs = pluginDirectory.GetDirectories("lib", SearchOption.AllDirectories).Select(x => new DirectoryCatalog(x.FullName));
    var directoryAggregate = new AggregateCatalog(catalogs);
    var container = new CompositionContainer(directoryAggregate);
```


From now on, deploying your modules will be easier than ever!