---
layout: post
title: NuGet and Hoster Packages in a CI environment
date: 2013-10-16 18:32:00
categories: [CI, Build, msbuild, NuGet, nupkg, nuspec, targets]
---

#What is NuGet?
[NuGet](http://www.nuget.org/) is the package manager for the Microsoft development platform including .NET. The NuGet client tools provide the ability to produce and consume packages. 

The NuGet Gallery is the central package repository used by all package authors and consumers.

#Restoring Packages on Build
NuGet has come a long way since it was first introduced and has gained a lot of popularity in our community. More and more parties are starting to ship their assemblies as NuGet packages and they're so easy to use that there really isn't any reason not to.

Building the packages themselves used to be a small pain to set up, but even that is implemented into NuGet that it's just a parameter away. By enabling the NuGet package restore feature, a few files are added to the solution.


[![Package Restore](//cdn.thuriot.be/images/NuGetCI/packagerestore.png)](//cdn.thuriot.be/images/NuGetCI/packagerestore.png)


One of these files is an msbuild targets file. It generally contains data that (as most of you know) allows the user to restore packages as a pre-build action. This way, the actual packages don't have to be checked into version control.


[![Targets](//cdn.thuriot.be/images/NuGetCI/targets.png)](//cdn.thuriot.be/images/NuGetCI/targets.png)


*As of [version 2.7+](https://docs.nuget.org/docs/reference/package-restore#MSBuild-Integrated_Package_Restore) of NuGet, this approach is no longer needed if you just want to restore the packages. The option is still available, though, in case you require more specific settings. For more information about the automatic package restore in v2.7+ and how to possibly migrate your solution, you can visit the nuget docs [here](http://docs.nuget.org/docs/workflows/migrating-to-automatic-package-restore).*

#Building Packages
Another neat feature implemented in this file, however, is something that can be triggered using the "BuildPackage" parameter, which can be passed to msbuild. When setting this parameter to "true", NuGet packages will be automatically build as a post-build event. NuGet will automatically retrieve all metadata from the project and generate a fitting nuspec file, rending <a href="/projects/nuget-build-and-deploy/" title="NuGet build and deploy" target="_blank">one of my previous projects</a> completely useless. In case this generated nuspec isn't sufficient, you can create a custom nuspec in the root folder of the project. If this file has the same name as your csproj, NuGet will automatically merge the metadata it retrieves from the project with the nuspec file you placed there. Magic!

Long story short, setting up automatic NuGet package creation in a CI environment is peanuts. 

At this point, you might be thinking *"Alright, Steven, what exactly are we trying to do here? We're just scratching some basic nuget stuff here..."*. 

Hold your horses, here comes the tricky part. What if you’re going a step further than that? One of my current projects contains a hoster application. The idea was to allow the user of my framework to easily create a module with all their specific logic, without having to worry to much about that specific window, WPF and framework logic that gets rewritten every time you work on a similar project. This module can be seen as a simple MEF plugin that the hoster will pick up. The hoster itself will take care of all the visuals, navigation through these modules and much more. 

#Hoster as a package
Because all of the separate parts can easily be managed as NuGet dependencies, it would be very useful if the actual hoster executable was distributed as a NuGet as well. Starting NuGet v2.3, the packages support including custom targets and props files. Writing one to copy the hoster to the output folder would then be peanuts.

```xml
< ?xml version="1.0" encoding="utf-8"?>
<project ToolsVersion="4.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">

    <propertygroup>
        <startaction>Program</startaction>
        <startprogram>$(TargetDir)Nova.Shell.exe</startprogram>

        <builddependson>
            $(BuildDependsOn);
            CopyNovaShell;
        </builddependson>
    </propertygroup>
        
    <target Name="CopyNovaShell">
        <copy SourceFiles="$(MSBuildThisFileDirectory)\..\..\tools\net45\Nova.Shell.exe" DestinationFolder="$(TargetDir)"></copy>
    </target>
    
</project>
```

The above targets file will automatically copy my hoster executable, included in the NuGet package, to the output folder as a post-build event. With this set up, I set up my CI builds and turned on the "BuildPackage" feature. Everything was working out well, except for the hoster package. NuGet was automatically adding the hoster exe to the lib folder in the NuGet package. Because of this, referencing the NuGet would reference the hoster in my module project, and that was exactly something I did not want!

As a fix for this issue, I wrote my own custom targets file that picks up in the NuGet build chain and imported it in my hoster project.

```xml
< ?xml version="1.0" encoding="utf-8"?>
<project ToolsVersion="4.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
        
    <propertygroup Condition="$(BuildPackage) == 'true'">
                <previousbuildcommand>$(BuildCommand)</previousbuildcommand>
                <buildcommand>echo Starting custom nuget pack</buildcommand>
                                
        <builddependson>
            $(BuildDependsOn);
            PackageNuGet;
        </builddependson>
    </propertygroup>
        
    <target Name="PackageNuGet">
                <getproductversion AssemblyFileName="$(TargetDir)Nova.Shell.exe">
                        <output PropertyName="AssemblyInfoVersion" TaskParameter="ProductVersion"></output>
                </getproductversion>
                
        <exec Command="$(NuGetCommand) pack &quot;$(ProjectDir)NuGet\Nova.Shell.nuspec&quot; -p OutputPath=&quot;$(TargetDir);version=$(AssemblyInfoVersion)&quot; -o &quot;$(PackageOutputDir)&quot; -symbols "></exec>
                
                <createproperty Value="$(PreviousBuildCommand)">
                        <output PropertyName="BuildCommand" TaskParameter="Value"></output>
                </createproperty>
    </target>
                
        <usingtask TaskName="GetProductVersion" TaskFactory="CodeTaskFactory" AssemblyFile="$(MSBuildToolsPath)\Microsoft.Build.Tasks.v4.0.dll">
        <parametergroup>
            <assemblyfilename ParameterType="System.String" Required="true"></assemblyfilename>
            <productversion ParameterType="System.String" Output="true"></productversion>
        </parametergroup>
                
        <task>
            <reference Include="System.Core"></reference>
            <using Namespace="System"></using>
            <using Namespace="System.Diagnostics"></using>
            <using Namespace="System.IO"></using>
            <using Namespace="System.Net"></using>
            <using Namespace="Microsoft.Build.Framework"></using>
            <using Namespace="Microsoft.Build.Utilities"></using>
            <code Type="Fragment" Language="cs">
                < ![CDATA[
                                this.ProductVersion = FileVersionInfo.GetVersionInfo(this.AssemblyFileName).ProductVersion;
            ]]>
            </code>
        </task>
    </usingtask>
</project>
```

The above script will temporarily overwrite the NuGet build command and replace it with a custom one. The custom build command will read out the Assembly Informational version attribute of the package you're trying to build and use it to build and version the Nuget package we desire. The actual nuspec I used as a template looks like this:


```xml
< ?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2013/01/nuspec.xsd">
    <metadata minClientVersion="2.3">
        <id>Nova.Shell</id>
        <version>$version$</version>
        <title>Nova Shell</title>
        <authors>Steven Thuriot</authors>
        <owners>Steven Thuriot</owners>
        <licenseurl>https://github.com/StevenThuriot/Nova/blob/master/LICENSE.md</licenseurl>
        <projecturl>http://github.com/StevenThuriot/Nova</projecturl>
        <requirelicenseacceptance>true</requirelicenseacceptance>
        <description>Small graphical framework to quickly start developing your apps without having to worry too much about controls and looks.</description>
    </metadata>
    <files>
        <file src="Nova.Shell.targets" target="build\net45\Nova.Shell.targets"></file>
        <file src="$OutputPath$Nova.Shell.exe" target="tools\net45\"></file>
    </files>
</package>
```

The result of all of this work, is a NuGet package without a lib folder, that contains our hoster executable in its tools folder. Combined with an internal targets file, the hoster gets copied to the output directory and used as the start-up parameter when starting the csproj with Visual Studio.

Combine all of this with the automated builds and we have set up an easy and automatic way to create and push our NuGet hoster package.