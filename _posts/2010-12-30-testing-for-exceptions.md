---
layout: post
title: Testing for exceptions
date: 2010-12-30 12:51:00
categories: [C#, Helper, Exceptions]
---

Every piece of software should at least have unit tests. Quite a few of these tests will probably be used to see if the method is correctly throwing an exception when needed.

However, often the unit test's *ExpectedException* attribute just doesn't cut it. Imagine having two possible exceptions thrown from a certain method, both having the same exception type but different messages. To make testing for this easier, I wrote a little helper class!

```csharp
using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace Assertion.Test
{
    public class AssertHelper
    {
        ///<summary>
        /// Checks of the action throws the specified Exception.
        /// It also checks if the messages are the same.
        /// </summary>
        /// <typeparam name="T">The type of exception to be thrown.</typeparam>
        /// <param name="action">The action to be performed.</param>
        /// <param name="expectedMessage">The expected message.</param>
        public static void Throws<T>(Action action, String expectedMessage)
             where T : Exception
        {
            Boolean fail = false;
    
            try
            {
                action.Invoke();
                fail = true;
            }
            catch (Exception exc)
            {
                Assert.AreEqual<Type>(typeof(T), exc.GetType(),
                         "An exception of the wrong type was thrown ({0} instead of {1}).",
                         exc.GetType().Name, typeof(T).Name);
                Assert.AreEqual<String>(expectedMessage, exc.Message, "The messages are not equal.");
            }
     
            if (fail)
                Assert.Fail("Exception of type {0} should have been thrown.", typeof(T).Name);
        }
    }
}
```

This method will check if the exception gets thrown, if it throws the correct type of exception and if the message is correct!

Using it goes as follows:

```csharp
AssertHelper.Throws<RepositoryException>
(
    () => object.Method(),
    "This is the exception's message!"
);
```

The generic refers to the exception that you are expecting. The first parameter is the method that will be called, the second is the message that the thrown exception will show.