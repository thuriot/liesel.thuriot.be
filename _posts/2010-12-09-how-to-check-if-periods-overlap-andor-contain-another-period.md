---
layout: post
title: How to check if periods overlap and/or contain another period?
date: 2010-12-09 11:39:00
categories: [C#, Helper, DateTime]
---

Checking for overlap can be quite tricky. It's not hard at all to make the whole process far too complicated, resulting in a lot of overhead. Because of this, I decided to think about the easiest way to check for this and expand my helper class from the previous post.

Imagine having a class called `Period`. This class contains a start and end date.

```csharp
public class Period
{
	///<summary>
	/// Gets or sets the start date.
	///</summary>
	///<value>The start date.</value>
	public DateTime Start { get; set; }

	///<summary>
	/// Gets or sets the end date.
	///</summary>
	///<value>The end date.</value>
	public DateTime End { get; set; }
}
```

The helper class accepts two periods. It is possible to check if the periods overlap or if one period completely contains the other.

```csharp
using System;

namespace Helpers
{
    ///<summary>
    /// Helpers.OverlapHelper
    ///</summary>
    public static class OverlapHelper
    {
        ///<summary>
        /// Determines whether the specified periods overlap.
        ///</summary>
        ///<param name="period1">The first period.</param>
        ///<param name="period2">The second period.</param>
        ///<returns>
        /// 	<c>true</c> if the specified periods overlap; otherwise,<c>false</c>.
        ///</returns>
        public static Boolean HasOverlap(Period period1, Period period2)
        {
            return period2.Start< period1.End && period2.End > period1.Start;
        }

        ///<summary>
        /// Determines whether period1 contains period2.
        ///</summary>
        ///<param name="period1">The first period.</param>
        ///<param name="period2">The second period.</param>
        ///<returns>
        /// 	<c>true</c> if period1 contains period2; otherwise,<c>false</c>.
        ///</returns>
        public static Boolean Contains(Period period1, Period period2)
        {
            return period2.Start >= period1.Start && period2.End<= period1.End;
        }
    }
}
```


And of course, some test cases. Period 1 starts March 23rd and stops March 28th.

**Testcases for Overlap**

```xml
18/3 – 25/3 –> true  &&	true  –> true
18/3 – 29/3 –> true  &&	true  –> true
25/3 – 29/3 –> true  &&	true  –> true
24/3 – 27/3 –> true  &&	true  –> true
18/3 – 22/3 –> true  &&	false –> false
29/3 – 30/3 –> false && true  –> false
```

**Testcases for Contains**

```xml
18/3 – 25/3 –> false && true  –> false
18/3 – 29/3 –> false && false –> false
25/3 – 29/3 –> true  && false –> false
24/3 – 27/3 –> true  && true  –> true
18/3 – 22/3 –> false && true  –> false
29/3 – 30/3 –> true  && false –> false
```
