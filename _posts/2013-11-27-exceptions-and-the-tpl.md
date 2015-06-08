---
layout: post
title: Exceptions and the TPL
date: 2013-11-27 10:50:00
categories: [.NET, Helper, C#, Exceptions]
cover: http://cdn.thuriot.be/Covers/Carnivorous-Rabbit.jpg
---

When an exception occurs while using the TPL, it will always get wrapped with an [AggregateException](http://msdn.microsoft.com/en-us/library/system.aggregateexception.aspx) before you can catch and handle it. This makes catching specific exceptions quite bothersome as you're basically writing a catch-all block. Bad practices set aside, unwrapping the exception usually meant losing the callstack as well.

This is, *of course*, something you do not want to happen as the callstack contains valuable information.

```csharp
try
{
    var task = Task.Run(...)
    task.Wait();
}
catch(AggregateException ex)
{
    ExceptionDispatchInfo.Capture(ex.InnerException).Throw();
}
```

Due to the new [async/await](http://msdn.microsoft.com/en-us/library/vstudio/hh191443.aspx) system Microsoft introduced in .NET 4.5, they simplified this greatly by introducing the [ExceptionDispatchInfo](http://msdn.microsoft.com/en-us/library/system.runtime.exceptionservices.exceptiondispatchinfo.aspx) helper.

By using this class, you are able to rethrow a caught exception object without losing the callstack. This allows you to unwrap the [AggregateException](http://msdn.microsoft.com/en-us/library/system.aggregateexception.aspx) and rethrow the actual exception. This allows you or the users of your code to catch specific exceptions.

The snippet above is, of course, not a very realistic way to use this helper class, but shows what it does perfectly.