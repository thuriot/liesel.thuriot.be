---
layout: post
title: Colored Console TraceListener
date: 2015-08-31 18:38:00
cover: //cdn.thuriot.be/images/Covers/ascii.png
categories: [C#, TraceListener, Trace, Console]
---

Writing to the `Console` can provide a lot of useful information while developing. While this can easily be done by using the static `Console` class, I prefer using the `Trace` class instead.

Doing it this way, our code is easily reusable for other kinds of logging and provides the ability to add additional metadata, which can also be used to filter the messages (e.g. the type).

`System.Diagnostics` provides the `ConsoleTraceListener` class to combine these two. But I like to spice it up a bit and color-code the different types of events.

This can easily be done by inheriting the provided TraceListener and overriding the `ConsoleColor` before writing our events.

```csharp

public class ColorConsoleTraceListener : ConsoleTraceListener
{
    static readonly IReadOnlyDictionary<TraceEventType, ConsoleColor> _colors;
    static ColorConsoleTraceListener()
    {
        _colors = new Dictionary<TraceEventType, ConsoleColor>
                {
                    {TraceEventType.Verbose,      ConsoleColor.DarkGray},
                    {TraceEventType.Information,  ConsoleColor.Gray},
                    {TraceEventType.Warning,      ConsoleColor.Yellow},
                    {TraceEventType.Error,        ConsoleColor.DarkRed},
                    {TraceEventType.Critical,     ConsoleColor.Red},
                    {TraceEventType.Start,        ConsoleColor.DarkCyan},
                    {TraceEventType.Stop,         ConsoleColor.DarkGreen}
                };
    }

    readonly bool _prependEventType;
    readonly bool _prependSource;
    public ColorConsoleTraceListener(bool prependEventType = true, bool prependSource = true)
    {
        _prependEventType = prependEventType;
        _prependSource = prependSource;
    }

    public override void TraceEvent(TraceEventCache eventCache, string source, TraceEventType eventType, int id, string message)
    {
        if (Filter != null && !Filter.ShouldTrace(eventCache, source, eventType, id, message, null, null, null))
            return;

        Trace(source, eventType, message);
    }

    public override void TraceEvent(TraceEventCache eventCache, string source, TraceEventType eventType, int id, string format, params object[] args)
    {
        if (Filter != null && !Filter.ShouldTrace(eventCache, source, eventType, id, format, args, null, null))
            return;


        Trace(source, eventType, string.Format(CultureInfo.InvariantCulture, format, args));
    }

    void Trace(string source, TraceEventType eventType, string message)
    {
        ConsoleColor? previousColor;
        ConsoleColor color;

        if (_colors.TryGetValue(eventType, out color))
        {
            previousColor = Console.ForegroundColor;
            Console.ForegroundColor = color;
        }
        else
        {
            previousColor = null;
        }

        if (_prependSource) Write(source + " — ");
        if (_prependEventType) Write(eventType + " — ");
        WriteLine(message);

        if (previousColor.HasValue)
        {
            Console.ForegroundColor = previousColor.Value;
        }
    }
}
```
