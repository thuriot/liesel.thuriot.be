---
layout: post
title: Nuget Build And Deploy
date: 2012-03-05 18:41:00
categories: [C#, Deployment, NuGet]
---

After attending [Scott Hanselman](http://www.hanselman.com)'s [session at Techdays](http://channel9.msdn.com/Events/TechDays/TechDays-2011-Belgium/KEY01), I was really excited about [NuGet](http://nuget.org/).  It's so easy to use and so versatile. Only one thing bothered me, and  that is actually building your own NuGet package. First you need to let  it generate a nuspec file, fill in everything by hand and only then you  can let it generate your NuGet package. Then you need to update said  NuSpec file everything something of relevance changes.  It's not a hard  thing to do, it's just a bit bothersome and we'd be off better if this  was automated to some point.

So I started working on a little tool to help me build my NuSpec on  the fly and create a NuGet package right away and potentially use this  as a Visual Studio's build event.

The post build event can be implemented like this:

```xml
if "$(ConfigurationName)" == "Release" (  
  del /Q /F *.tmp
  "R:\PathToTheExecutable\NuGet.BuildAndDeploy.exe" /dll "lib\$(TargetFileName)" /outputdir "$(TargetDir)\.." /projectUrl http://thuriot.be/ /tags Small helper framework /dependencies "Ninject 2.2"
)
```

The build output then looks like this:

```xml
------ Rebuild All started: Project: Aikido, Configuration: Release Any CPU ------
  Aikido -&gt; E:\Projects\Aikido\Release\lib\Aikido.dll
  Generating the NuSpec file for Aikido Framework version 1.0.0.0.
  
  Finished generating the NuSpec file succesfully.
  Writing NuSpec file... NuSpec file saved succesfully.
  
  Starting to build the NuGet pack...
  
  Attempting to build package from 'Aikido_Framework.nuspec'.
  Successfully created package 'E:\Projects\- NuGet Packages\NuGet Packages\Aikido_Framework.1.0.0.0.nupkg'.

------ Skipped Rebuild All: Project: Aikido.Test, Configuration: Release Any CPU ------
Project not selected to build for this solution configuration 
========== Rebuild All: 1 succeeded, 0 failed, 1 skipped ==========
```

The generated NuSpec file looks like this:

```xml
<?xml version="1.0"?>
<package xmlns="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd">
  <metadata>
    <id>Aikido</id>
    <version>1.0.0.0</version>
    <authors>Steven Thuriot</authors>
    <owners>Steven Thuriot</owners>
    <projectUrl>http://thuriot.be/</projectUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <description>Small helper framework</description>
    <tags>Small helper framework</tags>
    <dependencies>
      <dependency id="Ninject" version="2.2" />
    </dependencies>
  </metadata>
</package>
```

I realise it's a quick and dirty solution, but for a tool this small and simple it really doesn't matter, nor is it worth spending a lot more time on it. It took a minimal amount of work to make, it does what it is supposed to do and that is more than enough for its purpose.

![GitHub](//cdn.thuriot.be/GithubIcon.png) You can take a look at the source code or download a built assembly on [GitHub](https://github.com/StevenThuriot/NuGet-Build-And-Deploy).

Enjoy!