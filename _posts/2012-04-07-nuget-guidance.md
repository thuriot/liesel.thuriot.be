---
layout: post
title: NuGet Guidance
date: 2012-04-07 17:22:00
categories: [C#, Deployment, NuGet]
---

Sometimes a NuGet package can contain complex install logic. When this is the case, it can be a real hassle for a C# programmer to write all the code in powershell. 


This project is a hoster for any "recipe" you include in your nuget package. Using MEF, the recipes will run inside this hoster project.

For your convenience, all you have to do is inherit BaseRecipe when creating new recipes.


Sample usage:

```csharp
using NuGetGuidance.Domain;
using System.IO;

public class Recipe : BaseRecipe 
{
	protected override bool Execute()
	{
		var result = Prompt("Server URI").Result;
		Log.Log("Received input: {0}", result);
		
		var project = File.ReadAllText(Project.FullName);
		
		//Do stuff	
	}
}
```