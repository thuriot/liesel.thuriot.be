---
layout: post
title: Avoid Count() methods
date: 2011-08-22 18:50:00
categories: [C#, LINQ, Count, Optimization]
---

At work I'm currently working with [dotTrace](http://www.jetbrains.com/profiler/) to check the performance of our application. A few of our issues were quickly traced back to the faulty usage of the Count() extension method.

Count() should be avoided as much as possible on IEnumerables. Count() is optimized to check for Count or Length properties, but if the used list doesn't have these implemented, Count() will iterate the entire list. We have a few fairly large lists in our application, so that quickly consumes quite a bit of time to run all the Count()'s. Unless you're interested in the exact size of your list, I would say to avoid this method at all costs. However, even in this case there are a few better options.

The most interesting option is to check with what kind of list you're working with. Lists like Collection, Array, List, ... either have a Length or Count property. This property is just a simple int that is already stored in the memory. It doesn't get much faster than this. The cost of calling these properties is neglectable. If the full size of your list is really important for your use case, it might pay off to switch to one of these types of lists.

In case you're not interested in the full size of the list and don't want to or can't use a list that implements one of these properties, don't worry, there are a few other tips and tricks to handle these. I noticed that most of the time, Count() is used to check if there are any items in the list (**Count() > 0 , != 0 or == 0** ). In this case it's much more interesting to use the LINQ Any() extension method. This method will check if there is one item in the list and return the result as a boolean. On a big list, you gain quite a bit of performance. Another common misusage of Count() is **Where(...).Count() > 0**. In this case, it's far better to use **Any(...)**. In case 0 isn't the number you're checking against, it's still better to use **Count(...)**  instead and drop **Where(...)**. Since **Where** is lazy, it won't matter much for performance, but I find that the readability of what you are trying to do is increased greatly.

For all the other cases, I wrote a few extension methods so it's possible to completely avoid using Count(). The idea behind these extension methods is that the list you're checking usually has a lot more items in it than the number you're checking against, for instance **> 2** on a list of 300 items. On these kinds of checks, my extension methods truly shine. Rather than counting the whole list, they count x+1 items from the list, where x is the number you're checking against. You don't need to do any more counting than x+1 as you can check any of the conditions with this amount. This way, the actual counting is reduced greatly. When used correctly, the average cost will be a lot lower than using **Count()**. All of the extension methods also have an overload to allow you to specify a **Where(...)** clause so it can do everything in one go, rather than having to do a **Where(...)** first and a **Count()** after.

```csharp
///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="comparePredicate">The comparison function.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<param name="wherePredicate">The filter predicate.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>The result of the passed predicate.</returns>
private static bool OptimizedCount<T>(IEnumerable<T> enumerable, int numberOfItems, Func<T, bool> wherePredicate, Func<int, bool> comparePredicate)
{
    if (enumerable == null || numberOfItems < 0) return false;

    if (wherePredicate != null)
    {
        enumerable = enumerable.Where(wherePredicate);
    }

    var numberOfItemsToCount = checked(numberOfItems + 1);
    var countedItems = 0;

    var enumerator = enumerable.GetEnumerator();
    while (enumerator.MoveNext() &amp;&amp; countedItems < numberOfItemsToCount)
    {
		countedItems++;
    }

    bool returnValue = comparePredicate(countedItems);

    return returnValue;
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains the same amount of items as defined in 'numberOfItems'.</returns>
public static bool CountEqualTo<T>(this IEnumerable<T> enumerable, int numberOfItems)
{
    return CountEqualTo(enumerable, numberOfItems, null);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<param name="wherePredicate">The filter predicate to apply to the list.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains the same amount of items as defined in 'numberOfItems'.</returns>
public static bool CountEqualTo<T>(this IEnumerable<T> enumerable, int numberOfItems, Func<T, bool> wherePredicate)
{
    return OptimizedCount(enumerable, numberOfItems, wherePredicate, x => x == numberOfItems);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains less items than defined in 'numberOfItems'.</returns>
[SuppressMessage("Microsoft.Naming", "CA1702:CompoundWordsShouldBeCasedCorrectly", MessageId = "CountLess")]
public static bool CountLessThan<T>(this IEnumerable<T> enumerable, int numberOfItems)
{
    return CountLessThan(enumerable, numberOfItems, null);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<param name="wherePredicate">The filter predicate to apply to the list.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains less items than defined in 'numberOfItems'.</returns>
[SuppressMessage("Microsoft.Naming", "CA1702:CompoundWordsShouldBeCasedCorrectly", MessageId = "CountLess")]
public static bool CountLessThan<T>(this IEnumerable<T> enumerable, int numberOfItems, Func<T, bool> wherePredicate)
{
    return OptimizedCount(enumerable, numberOfItems, wherePredicate,  x => x < numberOfItems);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains more items than defined in 'numberOfItems'.</returns>
public static bool CountGreaterThan<T>(this IEnumerable<T> enumerable, int numberOfItems)
{
    return CountGreaterThan(enumerable, numberOfItems, null);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<param name="wherePredicate">The filter predicate to apply to the list.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains more items than defined in 'numberOfItems'.</returns>
public static bool CountGreaterThan<T>(this IEnumerable<T> enumerable, int numberOfItems, Func<T, bool> wherePredicate)
{
    return OptimizedCount(enumerable, numberOfItems, wherePredicate, x => x > numberOfItems);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains less or the same amount of items as defined in 'numberOfItems'.</returns>
[SuppressMessage("Microsoft.Naming", "CA1702:CompoundWordsShouldBeCasedCorrectly", MessageId = "CountLess")]
public static bool CountLessOrEqualTo<T>(this IEnumerable<T> enumerable, int numberOfItems)
{
    return CountLessOrEqualTo(enumerable, numberOfItems, null);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<param name="wherePredicate">The filter predicate to apply to the list.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains less or the same amount of items as defined in 'numberOfItems'.</returns>
[SuppressMessage("Microsoft.Naming", "CA1702:CompoundWordsShouldBeCasedCorrectly", MessageId = "CountLess")]
public static bool CountLessOrEqualTo<T>(this IEnumerable<T> enumerable, int numberOfItems, Func<T, bool> wherePredicate)
{
    return OptimizedCount(enumerable, numberOfItems, wherePredicate, x => x <= numberOfItems);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains more or the same amount of items as defined in 'numberOfItems'.</returns>
public static bool CountGreaterOrEqualTo<T>(this IEnumerable<T> enumerable, int numberOfItems)
{
    return CountGreaterOrEqualTo(enumerable, numberOfItems, null);
}

///<summary>
/// Counts a list, keeping in mind the check you are planning to do on it.
/// This way you don't have to count every item when you don't need to, resulting in less overhead.
///</summary>
///<param name="enumerable">The list with items getting counted.</param>
///<param name="numberOfItems">The number of items that you are going to check for. The same number should be used in the predicate.</param>
///<param name="wherePredicate">The filter predicate to apply to the list.</param>
///<typeparam name="T">The type of item getting counted. This is of no relevance, just to keep the method generic.</typeparam>
///<exception cref="OverflowException">An overflow exception will be thrown when 'numberOfItems' equals int.MaxValue</exception>
///<returns>True if the list contains more or the same amount of items as defined in 'numberOfItems'.</returns>
public static bool CountGreaterOrEqualTo<T>(this IEnumerable<T> enumerable, int numberOfItems, Func<T, bool> wherePredicate)
{
    return OptimizedCount(enumerable, numberOfItems, wherePredicate, x => x >= numberOfItems);
}
```

A few more tips and tricks regarding **Count()**'s. Do not use them in the check condition of for-loops. It will be executed every loop, causing a severe performance issue.

Another, in my opinion, interesting optimization is the following one:

Original code where the sublist is a Collection:

```csharp
var number = list.SelectMany(x => x.SubList).Count();
```

Optimized code:

```csharp
var number = list.Sum(x => x.SubList.Count);
```

This way it will only make the sum of a few integers, which is much faster than creating one big list in memory, then count all the items.