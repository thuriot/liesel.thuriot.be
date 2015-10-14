---
layout: post
title: Daily Tracing
date: 2015-10-14 20:06:00
cover: //cdn.thuriot.be/images/Covers/library.jpg
categories: [C#, Tracing, Logging]
---

No doubt about it. Tracing is very important when working on a project.

Not only will it make tracking down bugs easier, it will also make it a lot easier to get some numbers for general usage, timings, etc.

On a project I'm currently working on, it's very interesting to have a lot of tracing. And I do mean `a lot`! The project is quite large and the logic is incredibly complex (sadly, by its very nature). Log files were growing fast, faster than we could manage. However, at any given time, we'd only be interested in traces from the last three days, tops.

I created a `TraceListener` that allows you to trace each day to an individual file. It will concatenate the date to the given file name. As soon as it notices we started a new day, it will create a new file and start writing to that one instead. At the same time, it will clean up any files older than three days, as those are not relevant to us anymore. The number of days it should keep, as well as the formatting of the file's title can easily be adjusted in code.

```csharp
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;

public class DailyTraceListener : TraceListener
{
    private readonly string _logLocation;

    private StreamWriter _writer;
    private DateTime _today;

    public DailyTraceListener(string name)
    {
        _logLocation = name;
    }

    private TextWriter EnsureWriter()
    {
        if (_today == DateTime.Today) return _writer;

        if (_writer != null) _writer.Dispose();

        _today = DateTime.Today;

        var directoryName = Path.GetDirectoryName(_logLocation);

        if (string.IsNullOrEmpty(directoryName))
            directoryName = AppDomain.CurrentDomain.BaseDirectory;

        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(_logLocation);
        var extension = Path.GetExtension(_logLocation);

        var fileName = fileNameWithoutExtension + "_" + _today.ToString("yyyyMMdd") + extension;

        var file = Path.Combine(directoryName, fileName);

        _writer = new StreamWriter(file, true);


        //Keep the last 3 days, delete the rest, but keep at least 3 files, even if they are older
        const int magicNumber = 3;
        var oldFiles = Directory.GetFiles(directoryName, fileNameWithoutExtension + "*" + extension)
                                .Select(x => new { Path = x, LastWrite = File.GetLastWriteTime(x) })
                                .OrderByDescending(x => x.LastWrite)
                                .ToArray();

        if (oldFiles.Length > magicNumber)
        {
            var fewDaysAgo = _today.AddDays(-magicNumber);

            foreach (var oldFile in oldFiles.Where(x => x.LastWrite < fewDaysAgo).Select(x => x.Path))
                try { File.Delete(oldFile); } catch { /* ignore */ }
        }

        return _writer;
    }

    public override void Write(string message)
    {
        EnsureWriter().Write(message);
    }

    public override void WriteLine(string message)
    {
        EnsureWriter().WriteLine(message);
    }

    public override void Flush()
    {
        if (_writer != null)
            lock (this)
                if (_writer != null)
                    _writer.Flush();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            if (_writer != null)
                _writer.Dispose();
    }
}
```
