---
layout: post
title: Multilanguage using Resource files (resx) in C# .NET
date: 2011-05-15 13:09:00
categories: [C#, .NET, Resources, Reflection, Multilanguage]
---

I'm currently working on a little helper framework and started placing all my strings in a resource file to keep my code as tidy as possible.

At this point I started wondering, what if people want to use my framework, but don't want these messages appearing in English? Or even just want to slightly change the formatting of the messages I'm placing in my resource file?

"Okay", I thought, "I'll just change the resource file from embedded to external, then people can change it all they want". Sadly, things are never as easy as they may appear. Resource files need to be compiled as they have a code behind, thus you can't just make them external. Writing an entire reader wasn't an option for me either, as I found that way too much overhead, both for the speed of the framework as the work for the programmer. I also wanted to keep the easy-to-use resource files in my solution.

"Time for a new plan", I said to myself. "We could create a second project file and place our resources in there. We could then release this project as an open source project so people could easily compile it into a DLL that the framework would use". It's quite obvious that your first ideas are never the good ones. Overcomplicating everything can sometimes be far too easy. Time to step back, relax and really start thinking things through. At this point I decided to take a look at how the code behind these resource files actually worked. They're actually fairly easy put together. For everything you put in your resource file, one getter property is generated. This getter property will refer to a resource manager that will read in the resource file. Right there and then, I saw the light!

"I'll just give people access to the resource manager's setter. Then they can replace it with their own!". A step in the right direction, but not there just yet. The problem is that this property does not have a setter. It only has a getter with a private backing field that gets initialized during the first call to it. Adding a setter wasn't an option, as every time you change something in your resource file, it will regenerate your code behind. If you forget about this setter, change something in your resource file and release your newly compiled framework, you will break people's code because your setter will be missing! A second idea was to create a partial class that had a property with getter and setter, giving access to this private field. While this seemed great, the problem is that the code behind the resource file is not a partial class. So every time you'd change something, it would be regenerated again and you'd have to place in the "partial" keyword to make your code compile again. You'd also have two properties that more or less have the same functionality. It would also mean that my resource file had to be public, right in plain sight for everyone to see. At least you wouldn't be breaking other's code any more though. But no, this was <em>not</em> good enough. I had to think of something that worked completely independent of my resource class.

I figured I'd make a static *Settings* class. In this class I'd place a property that accepts a resource manager. It looks like this:



```csharp
  ///<summary>
 /// In case the default resource implementation does not suffice (e.g. you desire a translation),
 /// it is possible to replace it by your own.
 /// If the new resource manager doesn't have all the needed resources, it will not be set.
 ///</summary>
 public static ResourceManager Resource
 {
     get { return MyFrameworkResourceFile.ResourceManager; }
     set { SetResource(value); }
 }
```



My setter has a call to a method to check if the new resource manager is compatible. It will check if all the keys defined in my resource file are also present in the new file. Because a private field has to be set, it will use reflection to get to this goal. Checking if the keys are present will also be done using reflection. The method is implemented like this:



```csharp
  ///<summary>
 /// Test if the new resource manager has all the needed resources.
 /// If it misses one or more values, it will keep the current resource manager.
 ///</summary>
 ///<param name="resourceManager">The new resource manager.</param>
 private static void SetResource(ResourceManager resourceManager)
 {
    if (resourceManager == null) return;

    var newKeys = new Collection();

    var newResourceSet = resourceManager.GetResourceSet(Culture, true, true).GetEnumerator();

    while (newResourceSet.MoveNext())
        newKeys.Add(newResourceSet.Key.ToString());

    var resourceType = typeof(MyFrameworkResourceFile);
    var properties = resourceType.GetProperties(BindingFlags.Static | (resourceType.IsPublic
                                         ? BindingFlags.Public
                                         : BindingFlags.NonPublic));

    var foundAllKeys = properties.Select(x => x.Name)
                                 .Intersect(newKeys)
                                 .Count() == (properties.Length - 2);

    if (!foundAllKeys) return;

    var resourceManagerField = resourceType.GetField("resourceMan",
                                    BindingFlags.Static | BindingFlags.NonPublic);

    if (resourceManagerField == null) return;

    resourceManagerField.SetValue(null, resourceManager);
 }
```



I can already hear what you are thinking... "But reflection is slow and you shouldn't use it". I couldn't agree more that it is slow. Well, slower. Completely not using it is something I don't fully agree on, however. There are cases where reflection works out quite well. As long as you don't start running it on huge lists or in for loops that run 100.000 times, reflection will always be an option for me.

I did some tests on the time it takes, just to give you an idea and to show you it's really not that bad. For this I created a resource file with **200** lines of resources (thus a code behind with 202 properties, as it also has a property for its resource manager and its culture).

Running it once successfully took an average of **0.016** seconds. Not that bad, huh? Running it 25.000 times still took less than **5** seconds. So, depending on how big your framework's resource file will be, this method will add at most 5 milliseconds to the start up time, which is quite acceptable. Especially since it makes both your as the user's life a lot easier.

As for the user, all (s)he would have to do is create their own resource file and insert all of the keys that are in the original resource file as well. It doesn't matter if there are other keys as well that you want to use in your own application. The runtime of the method will not be affected by this as it will only check for the needed properties, thus skipping all of the other ones. All you have to do is make sure that the resource file has a code behind as well, though it doesn't matter if it is set to internal or public. Both work the same. Actually setting your custom resource file would work like this:

```csharp
Settings.Resource = MyCustomResourceFile.ResourceManager;
```

It's as simple as that!



----

**[IMPORTANT] Edit:**

Since this post has been receiving quite a few questions that can be solved in much easier ways, I will try to clarify my intentions a bit.

The code supplied in my post gives the user of your framework more freedom to tinker with the actual resources when using your dll without having to do anything too fancy, e.g. change existing main resources or change things during runtime without changing the current culture. 

All in all, if all you want to do is supply a new non-supported language for your dll or any third party dll that you have the resx file for, supplying a completely new resource dll is the **best** way to go. Your users can then just create their own resx file and compile it into a satellite resource assembly using [Resource File Generator](http://msdn.microsoft.com/en-us/library/ccec7sz1.aspx) to compile the *resx* to a *.resources* file and then compile that file to a *resources.dll* using [Assembly Linker](http://msdn.microsoft.com/en-us/library/c405shex.aspx").

If we'd want to compile a resource file for the en-US culture, commands would be as following:

```xml
resgen.exe /compile xxx.en-US.resx
al.exe /out:TheApplication.xxx.en-US.resources.dll /embedresource: xxx.en-US.resources
```
