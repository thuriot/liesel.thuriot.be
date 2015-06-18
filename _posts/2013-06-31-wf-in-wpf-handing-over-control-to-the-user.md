---
layout: post
title: "WF in WPF: Handing over control to the user"
date: 2013-06-31 09:30:00
categories: [C#, WPF, .NET, UI, WF]
---

...because delivering an application set in stone doesn't always cut it.

[![Set in Stone](//cdn.thuriot.be/WFinWPF/Stone.jpg)](//cdn.thuriot.be/WFinWPF/Stone.jpg)

#What is which and which is what??
Before we begin, it is important that we understand all of the concepts used. So we will go over them first.

##WF: Windows Workflow Foundation
Workflow foundation is a Microsoft technology that provides the developer with an easy way to host an in-process workflow engine.

A workflow is a series of distinct programming steps or phases. A step in workflow is also referred to as an “Activity”. The .NET framework already provides a huge list of these activities, e.g. “Writeline”. While most things can already be achieved using these predefined activities, it is also possible for the developer to create their very own activities.

These activities can be used as building blocks to visually assemble a workflow.

[![.NET Framework Chart](//cdn.thuriot.be/WFinWPF/Chart.jpg)](//cdn.thuriot.be/WFinWPF/Chart.jpg)

##WPF: Windows Presentation Foundation
The Presentation Foundation is a graphical subsystem for rendering user interfaces in Windows-based applications. WPF runs on top of DirectX.

WPF views are built using XAML. This is an XML-based language to define and link various UI elements.


#Handing over control?
##Why?
A lot of the applications we build on a daily basis have a pretty solid foundation. The general guidelines are written down. These are then turned into code and a single purpose application is built.

But what happens when the requirements can change on a daily basis? Or when they can differ greatly on the context they’re used in?

This can be solved by handing over the control to the end user. By handing over simple building blocks, rather than lines of code written in stone, we can enable the user to customize the application to their needs at that particular time in an easy and playful manner.

[![Lego Building Blocks](//cdn.thuriot.be/WFinWPF/Lego.jpg)](//cdn.thuriot.be/WFinWPF/Lego.jpg)

By teaching the end user how to play with these blocks (or rather, Workflow Activities), (s)he can constantly keep shaping the application to their needs.

##How?
Wait a minute... All of this sounds rather hard! The end user won’t be happy with a giant software bill after developing all of this...

While it could be a lot of work, it is very easy to achieve this goal by combining WF with WPF!

The .NET framework comes with a Workflow designer specifically for WPF. With only a few lines of code, we can offer the end user a visual designer that is easy to use. By dragging and dropping activity blocks, a workflow that suits the user’s needs can be set up in a matter of minutes.

Not only is it easy to set up, it’s also very easy to execute, save and load workflows into the application! This way, the end user can set up several workflows they often require and load them up when needed.

###Snippet

This sample shows how to do it in only a few lines of *(granted, quick and dirty)* code:

####Window.xaml

```xml
<window x:Class="MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="350" Width="525">
    <grid x:Name="_Grid">
        </grid><grid .ColumnDefinitions>
            <columndefinition Width="Auto"></columndefinition>
            <columndefinition Width="*"></columndefinition>
            <columndefinition Width="Auto"></columndefinition>
        </grid>
        
        <contentpresenter Grid.Column="1" Content="{Binding View}"></contentpresenter>
    
</window>

```


####Window.xaml.cs

```csharp
private void CreateDesigner()
{
    var dm = new DesignerMetadata();
    dm.Register();
 
    _designer = new WorkflowDesigner();
    _designer.Load(new Sequence());
 
    var designerView = _designer.Context.Services.GetService&lt;DesignerView&gt;();
 
    designerView.WorkflowShellBarItemVisibility =
        ShellBarItemVisibility.Imports |
        ShellBarItemVisibility.MiniMap |
        ShellBarItemVisibility.Variables |
        ShellBarItemVisibility.Arguments |
        ShellBarItemVisibility.Zoom;
 
    ToolboxControl tc = GetToolboxControl();
    Grid.SetColumn(tc, 0);
 
    _Grid.Children.Add(tc);
 
    var propertyInspectorView = _designer.PropertyInspectorView;
 
    Grid.SetColumn(propertyInspectorView, 2);
    _Grid.Children.Add(propertyInspectorView);
    
    DataContext = _designer;
}
 
private static ToolboxControl GetToolboxControl()
{
    // Create the ToolBoxControl.
    var ctrl = new ToolboxControl();
 
    // Create a category.
    var category = new ToolboxCategory("category1");
 
    // Create Toolbox items.
    var tool1 = new ToolboxItemWrapper(typeof(Assign));
    var tool2 = new ToolboxItemWrapper(typeof(Sequence));
    var tool3 = new ToolboxItemWrapper(typeof(WriteLine));
 
    // Add the Toolbox items to the category.
    category.Add(tool1);
    category.Add(tool2);
    category.Add(tool3);
 
    // Add the category to the ToolBox control.
    ctrl.Categories.Add(category);
    return ctrl;
}
```


###Executing a workflow:

```csharp
_designer.Flush();
string workflow = _designer.Text;
var encoding = new ASCIIEncoding();
var bytes = encoding.GetBytes(workflow);

using (var stream = new MemoryStream(bytes))
{
    var activity = ActivityXamlServices.Load(stream);

    var invoker = new WorkflowInvoker(activity);
    invoker.Invoke();
}
```


###Result:
[![WPF View Result](//cdn.thuriot.be/WFinWPF/Result.png)](//cdn.thuriot.be/WFinWPF/Result.png)