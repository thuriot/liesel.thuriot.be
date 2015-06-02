---
layout: post
title:  Guard your code using LINQ and Reflection
date:   2010-12-23 10:13:00
categories: [C#, LINQ, Reflection, Guard]
---

Time to add another class to our Helpers.

Defensive programming is very important. Checking that every parameter is correct before working with them is simply a must. The code for doing something like this quickly becomes very repetitive. Writing a Guard class is the perfect way to keep everything in check and avoid duplicate code.

I decided to even take it a step further and use reflection to get the name of the method and the parameters where things are starting to go wrong and add them to the exception's message as extra information. The checks themselves are done using LINQ.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using Helpers.Extensions;

namespace Helpers
{
    ///<summary>
    /// Helper to make sure the passed parameters are correct.
    ///</summary>
    public static class Guard
    {

        ///<summary>
        /// Determines whether the typeToAssign can be assigned to the targetType
        ///</summary>
        ///<param name="typeToAssign">The type to assign.</param>
        ///<param name="targetType">Type of the target.</param>
        ///<exception cref="ArgumentException">The types can't be assigned.</exception>
        public static void CanBeAssigned(Type typeToAssign, Type targetType)
        {
            if (!typeToAssign.CanBeAssignedTo(targetType))
            {
                var message = String.Format(CultureInfo.CurrentCulture, targetType.IsInterface ?
                    "Type {0} can not be assigned to {1}: interface is not implemented." :
                    "Type {0} can not be assigned to {1}.", typeToAssign.Name, targetType.Name);

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Checks the guids to ensure they are not empty.
        ///</summary>
        ///<param name="arguments">The arguments.</param>
        ///<exception cref="ArgumentException">Some of the guids are empty.</exception>
        public static void GuidNotEmpty(params Guid[] arguments)
        {
            Boolean faultyArguments = (from t in arguments
                                       where t == Guid.Empty
                                       select t).Any();

            if (faultyArguments)
            {
                MethodBase methodBase = GetCallingMethod();
                var message = "Some guids are empty: " +
                    CreateMethodMessage(methodBase, arguments.ToObjectArray());

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Checks the dates to ensure they are in the future.
        ///</summary>
        ///<param name="arguments">The arguments.</param>
        ///<exception cref="ArgumentException">Some of the dates are in the past.</exception>
        public static void InTheFuture(params DateTime[] arguments)
        {
            Boolean faultyArguments = (from t in arguments
                                       where !t.InTheFuture()
                                       select t).Any();
            if (faultyArguments)
            {
                MethodBase methodBase = GetCallingMethod();
                var message = "Not all passed dates are in the past: " +
                    CreateMethodMessage(methodBase, arguments.ToObjectArray());

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Checks the dates to ensure they are in the past.
        ///</summary>
        ///<param name="arguments">The arguments.</param>
        ///<exception cref="ArgumentException">Some of the dates are in the future.</exception>
        public static void InThePast(params DateTime[] arguments)
        {
            Boolean faultyArguments = (from t in arguments
                                       where !t.InThePast()
                                       select t).Any();
            if (faultyArguments)
            {
                MethodBase methodBase = GetCallingMethod();
                var message = "Not all passed dates are in the past: " +
                    CreateMethodMessage(methodBase, arguments.ToObjectArray());

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Checks the arguments to ensure they aren't null.
        ///</summary>
        ///<param name="arguments">The arguments.</param>
        ///<exception cref="ArgumentException">Some of the arguments are null.</exception>
        public static void NotNull(params object[] arguments)
        {
            Boolean faultyArguments;

            try
            {
                faultyArguments = (from t in arguments
                                        where t == null
                                           select t).Any();
            }
            catch (ArgumentNullException)
            {
                faultyArguments = true;
            }

            if (faultyArguments)
            {
                MethodBase methodBase = GetCallingMethod();
                var message = "<NULL> has been passed: " +
                    CreateMethodMessage(methodBase, arguments);

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Checks the arguments to ensure they aren't null, empty or whitespace.
        ///</summary>
        ///<param name="arguments">The arguments.</param>
        ///<exception cref="ArgumentException">Some of the arguments are null, empty or whitespace.</exception>
        public static void NotNullOrWhiteSpace(params String[] arguments)
        {
            Boolean faultyArguments;

            try
            {
                faultyArguments = (from t in arguments
                                   where t.IsNullOrWhiteSpace()
                                   select t).Any();
            }
            catch (ArgumentNullException)
            {
                faultyArguments = true;
            }

            if (faultyArguments)
            {
                MethodBase methodBase = GetCallingMethod();
                var message = "<NULL>, empty or whitespace has been passed: " +
                    CreateMethodMessage(methodBase, arguments);

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Checks if the start datetime is before the end datetime.
        ///</summary>
        ///<param name="start">The start datetime.</param>
        ///<param name="end">The end datetime.</param>
        ///<exception cref="ArgumentException">The start datetime is after or equal to end datetime.</exception>
        public static void StartBeforeEnd(DateTime start, DateTime end)
        {
            if (!start.IsBefore(end))
            {
                MethodBase methodBase = GetCallingMethod();
                var message = "The start datetime is after or equal to end datetime: " +
                    CreateMethodMessage(methodBase, new object[] { start, end });

                throw new ArgumentException(message);
            }
        }

        ///<summary>
        /// Gets the calling method.
        ///</summary>
        ///<returns></returns>
        private static MethodBase GetCallingMethod()
        {
            MethodBase result = null;
            var currentStackTrace = new StackTrace(2, false);

            int totalFrameCount = currentStackTrace.FrameCount;
            if (totalFrameCount > 0)
            {
                result = currentStackTrace.GetFrame(0).GetMethod();
            }

            return result;
        }

        ///<summary>
        /// Creates the message.
        ///</summary>
        ///<param name="methodBase">The method base.</param>
        ///<param name="arguments">The arguments.</param>
        ///<returns></returns>
        private static string CreateMethodMessage(MethodBase methodBase, object[] arguments)
        {
            var builder = new StringBuilder();
            var prefix = String.Format(CultureInfo.CurrentCulture, "Class: {0} - Method: {1} - Args: ",
                !methodBase.IsNull() ?
                methodBase.DeclaringType.FullName : "", !methodBase.IsNull() ? methodBase.Name : "");

            builder.Append(prefix);

            int paramLength = 0;
            bool printArgumentNames = false;
            ParameterInfo[] methodParameters = null;

            if (arguments != null)
            {
                paramLength = arguments.Length;
            }

            if (methodBase != null)
            {
                methodParameters = methodBase.GetParameters();

                if (methodParameters.Length == paramLength)
                {
                    printArgumentNames = true;
                }
            }
            if (!arguments.IsNullOrEmpty())
            {
                for (int i = 0; i< arguments.Length; i++)
                {
                    if ((printArgumentNames))
                    {
                        builder.Append(methodParameters[i].Name);
                        builder.Append(" = ");
                    }

                    builder.Append("[");

                    builder.Append(arguments[i] != null ? arguments[i].ToString() : "NULL");

                    builder.Append("]");

                    if (i != arguments.Length - 1)
                    {
                        builder.Append(", ");
                    }
                }
            }
            else
            {
                builder.Append("No arguments");
            }

            return builder.ToString();
        }
    }
}
```



The code is very easy to use. Here are some sample methods:


```csharp
private void NullMethod(object object1, object object2, object object3)
{
	Helpers.Guard.NotNull(object1, object2, object3);

	//further logic
}

private void StringsMethod(String firstName, String lastName, String residence)
{
	Helpers.Guard.NotNullOrWhiteSpace(firstName, lastName, residence);

	//further logic
}

private void GuidMethod(string firstGuid, string secondGuid, string thirdGuid, string fourthGuid)
{
	Helpers.Guard.ParsableToGuid(firstGuid, secondGuid, thirdGuid);

	//further logic
}

private void DateMethod(DateTime dateTime, DateTime dateTime_2, DateTime dateTime_3)
{
	Helpers.Guard.DateInThePast(dateTime, dateTime_2, dateTime_3);

	//further logic
}
```

Because of the *params* keyword in the methods of the Guard class, it is possible to pass as much parameters to the method as needed.

Obviously, it's also possible to use multiple checks in one method.

```csharp
private void CombinedMethod(DateTime dateTime_1, DateTime dateTime_2, String string_1, String string_2)
{
	Helpers.Guard.DateInThePast(dateTime_1, dateTime_2);
	Helpers.Guard.NotNullOrWhiteSpace(string_1, string_2);
	//further logic
}
```

As for the output, running the following *Run* method (I am aware of the awkward and rather bad naming, it's merely to make it obvious how the output will be generated) would throw an exception

```csharp
private void testMethod(StringBuilder stringBuilder1, StringBuilder builder2, StringBuilder object3)
{
	Helpers.Guard.NotNull(stringBuilder1, builder2, object3);

	//logic
}

private void Run()
{
	StringBuilder builder1 = null;
	StringBuilder builder2 = new StringBuilder("Hello");
	StringBuilder builder3 = new StringBuilder(", world!");

	testMethod(builder1, builder2, builder3);
}
```

with this message. I've split it into several lines for readability. The actual message is in one line:

```markup
<NULL> has been passed: Class: Thuriot.Tests.GuardTest - Method: testMethod -
Args: stringBuilder1 = [NULL], builder2 = [Hello], object3 = [, world!]
```
