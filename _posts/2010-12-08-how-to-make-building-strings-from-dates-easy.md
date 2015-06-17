---
layout: post
title: How to make building Strings from dates easy?
date: 2010-12-08 14:47:00
categories: [C#, Format, Helper, DateTime]
---

While the DateTime object might already have quite some standard  formats for its ToString method, it's just not good enough to use directly in a front-end.

In some applications, outputting dates can become quite a recurring job. Because of this, I decided to  write a little helper class. This helper can easily be extended later by overloading the Print method to support other objects than just DateTime.

```csharp
using System;

namespace Helpers
{
    ///<summary>
    /// Helpers.PrintHelper
    ///</summary>
    public static class PrintHelper
    {
        ///<summary>
        /// Prints the specified date time.
        ///</summary>
        ///<param name="dateTime">The date time.</param>
        ///<returns></returns>
        public static String Print(DateTime dateTime)
        {
            return dateTime.ToString
                (
                    "dddd, '" +
                    AddOrdinal(dateTime.Day) +
                    " of' MMMM yyyy 'at' HH:mm:ss"
                );
        }

        ///<summary>
        /// Adds the ordinal.
        ///</summary>
        ///<param name="day">The day.</param>
        ///<returns></returns>
        private static string AddOrdinal(int day)
        {
            switch (day % 100)
            {
                case 11:
                case 12:
                case 13:
                    return day.ToString() + "th";
            }

            switch (day % 10)
            {
                case 1:
                    return day.ToString() + "st";
                case 2:
                    return day.ToString() + "nd";
                case 3:
                    return day.ToString() + "rd";
                default:
                    return day.ToString() + "th";
            }
        }
    }
}
```

You can then use it as following:

```csharp
String date = Helpers.PrintHelper.Print(DateTime.Now);
```

The variable "date" will then contain the datetime, formatted beautifully, including ordinals.

```xml
8th of December 2010 at 14:46:00
```
