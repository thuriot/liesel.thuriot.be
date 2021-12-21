---
layout: page
title: Curriculum Vitae
cover: //cdn.thuriot.be/images/Covers/Resume.jpg
---

# Steven Thuriot
* Date of birth: February 23, 1987
* Born in Leuven, Belgium
* Lives in Hoboken, Antwerp, Belgium
* Has a [linkedin](https://linkedin.com/in/steventhuriot) page
* And a [github](https://github.com/steventhuriot) one, too

## Personal Details

I have a large interest in learning new technologies and am very willing and eager to learn and improve myself, both technically as functionally. I am both interested in web and application design.

I graduated in 2010 and started my professional career as a consultant.

Before this, I studied Applied Computer Science. During my school career I have acquired a good base understanding of several programming languages and how to create a good functional design behind applications.

In my spare time, I enjoy thinking of and working on new tools. I always try to find new technologies to use while working on these applications. This enables me to get familiar with them and form a decent base to improve on in later projects.


# Professional Experience
## Domain Architect Digital Channels
* SD Worx
* Jan 2022 - Present
* Position: Domain Architect

As a domain architect, it is my responsibility to support the development and roadmap of our products. 

To develop an architectural vision, focussed on the near feature (12-18 months), translate this vision both functionally and technically towards the Digital Channels squads within the domain and support the product manager in building our roadmap.


## Engagement Products
* SD Worx
* Nov 2020 - Present
* Position: Senior Technical Analyst / Scrum Master
* Tools: Angular, ASP.NET Core, .NET6
* Platform: Azure

Full stack developer in Angular/ASP.NET Core, working on products part of the SD Worx Assistant, specifically targetting engagement with customers, e.g. a messaging system using an angular website to send messages to the mobile app and other channels. These messages can include rich content, surveys, polls, etc.. But also automated messages, like for instance a "happy birthday" message and insights pages (graphs).

Other projects include setting up a datavault of several sources, which can be used to either dynamically (by using filters) or statically create groups. These groups can be used on a company level. One implementation of these groups is allowing messages being sent to a specific group.

## SD Worx Assistant
* SD Worx
* Apr 2019 – Nov 2020
* Position: Senior Technical Analyst / Scrum Master
* Tools: Angular, ASP.NET Core, .NET Core 2 ~> .NET6
* Platform: Azure

Full stack developer in Angular/ASP.NET Core. 

Helping design and build a generic API that allows pluging in several building blocks in a way that the accompaning app can show and offer these blocks as tiles and offer their functionality. Other functionalities being built are things like push notifications to app users using a content management system as well as creating a system for creating groups that can be used as receivers for this system.

NLP Developer for the chat bot of the SD Worx Assistant.

## Reporting Suite
* SD Worx
* April 2014 - Apr 2019
* Position: Consultant /  Senior Lead Developer / Technical Analyst  
* Tools: C# v4.5+, WPF, AngularJS, WCF (Later replaced by WebApi), C++,  Autofac, NuGet, Visual Studio, TFS (Later replaced by VSO/Git), dotTrace,  dotMemory, DevExpress, TeamCity, Agile, … 

As part of a smaller team, I took up the role of Senior Lead Developer and work  on the reporting suite, originally written in WPF. This suite is a custom tool to  report on any data source within SD Worx with customized layouts and output.  One of the new data sources that we want to support is an older Btrieve  database.  

My main focus is to build a solution that supports reading the data from this  source using SQL syntax while building a tool that allows applying metadata  and transformations to the data supplied by Btrieve. To achieve this, we  created a code generator that will create assemblies that can be used to  synchronize and transform the original data to our own format which is stored  to drive in Memory Mapped Files (for speed).  

During execution some parts can be read directly from our transformed data,  while other parts need to be calculated at runtime. Complex expression trees  are generated during report execution and calculate the required data. Some of  the calculated code needs to be converted from C++ (eBlox’ original reporting)  to C# and adapted to work on our system.  

Performance is kept in mind the entire time, making sure the overall execution  and feel is as snappy as can be. 

The second objective is to convert the WPF client to an MVC one, using  AngularJS, while adding new functionality and providing a better user  experience.  

We work hard to keep this team up and running in an agile way. Short  standups, sprint planning, small consumable user stories, retrospectives and  poker sessions are just the start. 

As part of our migration to Visual Studio Online, I’ve worked hard to write out  guidelines for our team to follow when working with Git. How to branch, merge,  rebase, create pull requests, etc; The works! 

Finally, to keep everything running as smooth as possible, we’ve created a  Slack channel to smoothline our communication, especially when people are  working remotely. For this channel, I created a Slack Bot that responds to  commands typed in chat. This bot handles all the tedious work that would  otherwise fall on the team’s shoulders and reduces it to seconds. A few examples are looking up concerns (name or id) and their location on the  storage servers, queuing them for a full sync from the source data, test the  production servers if they’re up and running properly (e.g. after a new release)  and more… As a fun little extra, it’s also able to look up what’s for dinner on any  provided date. 


## xBlox: Payroll Management System
* SD Worx
* March 2013 – April 2014
* Position: Consultant / Technical Analyst
* Tools: C# v4.0, WPF, WCF, Autofac v3, NuGet, Visual Studio 2012, TFS 2010, Memory Profiler, dotTrace, Infragistics, TeamCity, Scrum, …

Continuation of the project I already worked on in 2011.

As part of a big team, I work on both technical analysis and implementation of front-end as well as server. This includes the rework and expansion of payroll related topics like workflows, suspensions, contract, pro rata, calendar, …

Besides creating and implementing new screens, I also research possible performance issues and optimize them. This is mainly for client side code and mostly in the WPF implementations. (e.g. simplifying the visual tree, optimizing resource usage, …)

## OdeionPlatform: Tools and Components
* SD Worx
* March 2012 – March 2013
* Position: Consultant / Technical Analyst
* Tools: C# v3.5/4.0, TPL, WPF, Autofac v1.1/2, NuGet, Visual Studio 2010/2012, TFS 2010, Memory Profiler, dotTrace.

OdeionPlatform is a framework that consists of two major parts. Odeion and Agora.
Agora is a WPF control library to promote consistency among controls of different applications. It implements SD’s specific control requirements found in the Style Guide. This library is based on Infragistics’ control library.

Odeion is one integrated application for internal and external use. It is a hoster application for multiple modules (Like payroll, customer accounting, …) that allows easy navigation and integration between these different modules. It consists of a underlying framework to manage the more tedious elements, several tools, documentation and guidelines. Odeion is a WPF software factory. It is created to promote consistency among screens and reduce the number of lines of code to build a screen. This way, the developers can focus on business functionality and enjoy increased maintainability.

Development speed is increased by the usage of custom made code generating tools. We created this tool to easily generate the several types of supported use cases in Odeion. This tool was based on Visual Studio’s VSPackage ability, that was added in Visual Studio 2010.

To easily deploy the framework, we created NuGet packages.

We are also responsible for giving out support on general WPF and how to use this framework to the development teams using it.

During our time on this framework, we also replaced the core of this framework: A threaded action queuing system. Due to several bugs caused by the architecture of the existing system, it was decided to be best to rewrite this core from scratch. We analyzed the existing system, created a new architecture to replace it and implemented it into the framework without any breaking changes for our users. The new system is far more robust and easier to debug while improving speed by a factor of 25%.

Other than working on new features and bug fixes on these frameworks, we also had a support role for the several modules using the framework. The support was mainly based on how to use the framework and how to correctly implement WPF.

## Customer Accounting

* SD Worx
* February 2012 – March 2012
* Position: Consultant
* Tools: Fiddler2, Actionlog Monitor, Panoptis, dotTrace

Track down any performance issues in this application and do a code review of the existing code for an outsourced team located in India.

## Team Foundation Branch Synchronizer

* SD Worx
* February 2012
* Position: Consultant
* Tools: C#.NET 4.0, Windows Presentation Foundation (WPF), Ninject v2, Team Foundation Server

In January, we (the developers of the xBlox project) started working with several dev branches in TFS rather than just one. Because of this, we started the policy to daily sync your dev branch with code on the main branch so they would stay up to date. A few team members had problems synchronizing their branch as branch-specific data (settings, dll’s, …) was being merged incorrectly which resulted in a lot of the settings being set to those of the main branch.
I wrote a little tool to help the whole sync process. It will merge all the open changesets from the main branch to the branch you’re working on, or the other way around when you’ve finished implementing the feature on your branch and want to push it to the main branch. If there are any merge conflicts, it warns you so you can resolve these on your own. After that, the tool will check your branch and correct any of the settings if needed.

These settings were stored in an external config file (app.config) so it is easy to maintain and easy to configure for any other project. The possible things the tool can fix are dll references, xml files (with xpath selectors), normal files (with line numbers, usually settings defined in postbuild scripts) and also had the ability to revert any file back to latest version found on TFS (useful for files like assemblyversion). For each setting, it is also possible to declare an exception for a certain branch.

## SD Wizard

* SD Worx
* December 2011 – January 2012
* Position: Consultant
* Tools: C#.NET 2.0, WinForms, The dotNetInstaller Bootstrapper

SD Worx receives a lot of helpdesk calls for problems they can’t remotely fix themselves. Because of this, it was desired that the customers could run a diagnose themselves first.
This tool checks if…

- Your Operating System is supported.
- You have the required certificates installed on your machine.
- You can successfully make a connection to the required URL’s.
- You have a PDF Reader installed.
- You have a smart card reader, drivers for this reader and the Belgium e-ID Middleware.
- You have the Citrix Receiver installed.
- You have the given selective trust rights to Citrix.
- Any of your installed browsers are officially supported.
- Your default browser is officially supported.

When the diagnose finishes, it will help the user to fix the discovered problems. If the tool is run with administrative privileges, it can try to do most of these itself.

This tool has multilingual support.

## Team Foundation Assembly Synchronizer

* SD Worx
* November 2011
* Position: Consultant
* Tools: C#.NET 4.0, Windows Presentation Foundation (WPF), Ninject v2, Team Foundation Server

Currently SD Worx’ commonly used assemblies are placed on a network drive. Because there were some version issues in the past (unwanted and breaking updates), SD desired that its dependencies for release branches were placed onto TFS as well.
This way it is guaranteed that they are using the versions they want and that upgrades can take place whenever they want.

This tool makes the synchronization between the network share and TFS easier. It automatically checks out the chosen assemblies, places the new versions on TFS and cleans up the old assemblies, all combined in an easy to use GUI.

## xBlox – Payroll management system

* SD Worx
* Januari 2011 – Februari 2012
* Position: Consultant
* Tools: C#.NET 3.5, DB2, Windows Presentation Foundation (WPF), Windows Communication Foundation (WCF), Autofac, Infragistics, Team Foundation Server, Domain-Driven Design (DDD), dotTrace, .NET Memory Profiler, Scrum, …

New version of SD Worx’ Blox Payroll management system.
Together with a number of other people, I created and implemented several screens, wizards, server logic and spent the rest of my time bugfixing existing and new code.

I was also in charge of dotTracing the application and tuning the performance of our code behind, as well as tuning the performance of our WCF calls, maintaining the TFS build scripts and deploying new versions to release.

Finally, I also helped implement new versions of the underlying framework and prepared the solution for the other developers to work on.

## TFS Synchronizer

* Compuware
* October 2010 – December 2010
* Position: Employee
* Tools: Team Foundation Server, Changepoint, SQL, C#.NET 4.0, WPF, Expression Blend and Ninject.

Team Foundation Server, as well as Changepoint, offers a way of creating work items and defect requests. The idea was to create a tool that takes care of the synchronization on both sides.
This tool is written in C# and uses the latest technologies like LINQ and WPF, as well as the latest versions of TFS and Changepoint. A few design patters were used here as well, including the prototype pattern to make the program dynamic.

The tool can both be run as a console application (which would be used for scheduling or as a service) and as an application with a GUI, which is created using Expression Blend 4.

The coupling in this project is taken care of by the Ninject framework, ensuring a loose coupling.

## Installing and migrating TFS and Sharepoint

* Compuware
* September 2010
* Position: Employee
* Tools: Team Foundation Server, SharePoint Server and SQL Server.

Compuware Zaventem was running Team Foundation Server 2008, connected to SharePoint Server 2007. This needed to be upgraded to the latest version. A new VM was set up to run these using VMWare ESX.
We migrated our existing TFS and SharePoint databases to the new machine, while simultaneously upgrading both to version 2010.

# Student Experience

## Task manager
KU Leuven
October 2009 – May 2010
Project for Methodologies for design of software
Position: Student
Tools: Java, Eclipse
As an assignment for a class called “Methodologies for design of software”, we had to create a task manager written in Java. The main goal was to think about design patterns and refactoring.
As far as refactoring goes, we found that splitting up some long methods and creating data containers for methods with huge parameter lists really improved the quality of our code.We decided to use the “Model-View-Controller” pattern as a structure for our project. We followed it to the letter and completely isolated our model from the view. Everything has to go through the controllers. Objects that could be passed to the view all implemented a certain interface. The controllers only passed these objects to the view as an implementation of this interface. As a result, the view has no idea whatsoever about any of the objects in the model or how they work.

We used quite a number of design patterns in this project, but other than MVC, the most important ones are the “State Pattern” and “Prototype”.

A task can have several states, each with their own set of rules. This, of course, is a perfect job for the state pattern. This pattern does a wonderful job to keep the system in a stable state as it only allows calling certain methods when in a certain state, each with their unique implementation.The system had to be completely dynamic as well. Rather than hard coding the objects, they have to be built up from an XML file. The prototype pattern is ideal for this. The system parses the XML file and creates a list of prototypes which it then stores in a repository. When we then want to use a certain type of object, the system makes a call to the repository which clones the prototype implementation, resulting in a completely dynamic object for the system to use.

## Personal website

* February 2010
* Tools: PHP, Photoshop, MySQL, JavaScript

I created an administration panel for my own website. The back-end of this panel is written in PHP, while the front-end is written in JavaScript to give a dynamic feel to it.The panel allows you to create pages and write the content using a WYSIWYG editor. Each page can have several subpages that belong to it. For instance, you can create a page “Projects” that has “Administration panel” as a subpage. This reflects mainly in the URL of the site.
The index page of the website was turned into a proxy. When visiting the website, it parses the entered URL. It then searches for the appropriate pages in the MySQL database. If it can’t find the page, it will show a 404 page instead.

I also created a template for this website. Because the pages are fully dynamic, this template had to be dynamic as well. The panel has a section called “button manager”. Here you can create and fill in the text you want to button to show and the page you want to link it to. The panel will then automatically generate the images for these buttons and save the links into the MySQL database.

Because screen resolutions among the viewers greatly differ these days, I also created a smaller version of the website. The panel will detect your browser size and will decide which of both templates suits your screen best. This ensures pleasant viewing.

## Website administration panel

* Compuware
* October – December 2008
* Position: Trainee (Internship)
* Tools: C#.NET, ASP.NET, SQL

During my final year in college, I did my internship at Compuware. It was my assignment to create an administration panel for their website. This panel allows you to create web pages on the fly.
The content of these pages is easily built using a WYSIWYG rich text editor. In other words, the user doesn’t have to worry about the html mark up itself. Instead you have a “Microsoft Word”-like environment to work in that automatically generates the HTML code for you. Once you save, the content is stored into a SQL database. The pages can still be edited later on using the same editor.

Once a page is created, it still has to be published before it actually appears on the site. A drag and drop system allows you to publish the page into the section of the website you want.

Using this system, the content of the whole website is dynamic. It has several different sections like the front page, job offers, information about products and so on…

## WiiMote game

* Erasmushogeschool Brussel
* October 2008 – June 2009
* Position: Student
* Tools: C#.NET, design in Cinema 4D & Photoshop

For my bachelor test in the Erasmushogeschool in Brussels, I decided to do something with the WiiMote.
First of all, I had to learn how to connect it to the computer. Then I had to find out how to read out the values submitted by the WiiMote. After getting familiar with how the WiiMote works, I started on the actual project.

I created a game, written in C#, using the XNA framework. This game is a 3D space shooter that had two different levels to play. It automatically detects if you have a WiiMote or not. If you do, it lets you use the accelerometers inside the WiiMote to control your spaceship. The buttons on the WiiMote could then be used to aim the canon and fire. If you don’t have a WiiMote, it automatically switches the settings to let you use the keyboard instead.

The 3D environments, ships and weapons were all designed in Cinema 4D. The head-up display and several 2D graphics were created in Photoshop.

## Hairstudio Admin

* Hairstudio Christel en Glen
* July 2007
* Position: Student
* Tools: VB.NET, Microsoft Access, Winforms

Hairstudio Admin is a tool that allows Christel and Glen to keep track of all the customers’ details, their visits and their preferred treatments.
It has an easy to use list with all the customers in it. It is sorted alphabetically and allows you to search through it using wildcards.

A new user can easily be created by the click of a button. It then allows you to store all the details of the customer. A few examples are cell phone, address, date of birth, e-mail and so on. Extra details can be noted in a big textbox, for example which color of dye they prefer. A picture of the customer can also be added to the details.

The tool also has an easy to use visitor list. When the customer visits, it’s as easy as clicking a button to add the current date into the database. The tool has a list of dates so you can easily check when a certain customer visited.

## Resident administration tool

* Fedasil
* September 2005 – May 2006
* Position: Trainee (Internship)
* Tools: Visual Basic for Applications, Microsoft Access

For my final year in high school, I had the assignment to create an administration tool for Fedasil in Steenokkerzeel. This tool allows them to keep detailed information about their current and former residents. The database is fully encrypted so it can’t be read out directly. Reports can easily be created per resident.
As a second function of the system, it allows them to create badges with some basic information, a picture and most importantly, a barcode.

The personnel can use these to sign in and out every day. The system automatically keeps track of the hours they worked. It also allows them to keep track of their vacation days and when they want to take a day off. All of this can be exported to an Excel file with the correct mark up.A second program, connected to the same database, requires the personnel to sign in using their badge. If they have the appropriate access rights, the system signs them in and allows them to use certain parts of the administration tool. Each user has a level of rights, allowing them to only access the parts of the administration program that the global administrator granted them. This is configurable in the same panel when logging in with an administrator account.

The residents are not allowed to leave the building on their own, so they were given a badge to check out when they leave in a group with a supervisor. They have to check in again when returning. This enables the personnel to keep track of the residents and easily notice if one had gone missing along the way. In case one did, the system automatically creates reports of these residents and then mails them to the police.

## Internal portal
* Phizer
* August 2004
* Position: Student Job
* Tools: HTML

During my student job at Phizer, I helped develop an internal website they were setting up. My main goal here was to improve the mark up and layout of several pages.

#Education
* 2009 – 2010 Katholieke Universiteit Leuven
	* Bridging program: Master in Applied Computer Science
* 2006 – 2009 Erasmushogeschool Brussel
	* Graduated magna cum laude
	* Education: Applied Computer Science
	* Specialisation: Multimedia
	* Certificate of basic knowledge of business management and economy.
* 2004 – 2006 Miniemeninstituut Leuven
	* Graduated magna cum laude
    * Education: IT Management
	* Certificate of basic knowledge of business management and economy.
* 1998 – 2004 Heilig-Hartcollege Tervuren
	* Education: Mathematics Science