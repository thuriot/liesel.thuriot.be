---
layout: post
title: Playing with Sets
date: 2015-10-08 17:29:00
cover: //cdn.thuriot.be/images/Covers/color-paint-cans.jpg
categories: [C#, Extensions]
---

The [`Distinct`](https://msdn.microsoft.com/en-us/library/vstudio/bb348436.aspx) method is one of the really useful methods in the `System.Linq` namespace. Internally, it's really simple, too. It will just iterate your collection and add them all to a [`HashSet`](https://msdn.microsoft.com/en-us/library/bb359438.aspx). The set will make sure that each item is only added once on its own.

Instead of adding all items and returning just the set, `Distinct` will actually create an iterator that will return the item if successfully added. While this is a good idea since the actual execution is deferred, at times it is nice to just create the set and keep working with it, instead.

While this is simple enough as is, I created an extension method anyway.

```csharp
public static HashSet<T> ToSet<T>(this IEnumerable<T> source)
{
    return new HashSet<T>(source);
}
```

It's a bit too simple to post, really. One could argue it's too simple to exist, even. And frankly, it is. So we'll go a step further, and allow creating the set based on a key.

```csharp
public static HashSet<T> ToSet<T>(this IEnumerable<T> source, Func<T, TKey> keySelector)
{
    return new HashSet<T>(source, keySelector.AsComparer());
}
```

Continuing the `LINQ` way of thinking, it would be nice to just pass a `Func` along to the method to create the key. However, `HashSet` doesn't accept this and wants a comparer instead. So let's create a comparer that will wrap around our `Func`!

```csharp
public static class FunctorComparerExtensions
{
   public static FunctorComparer<T> AsComparer<T, TKey>(this Func<T, TKey> keySelector)
   {
       var comparer = Comparer<TKey>.Default;
       Comparison<T> comparison = (x, y) => comparer.Compare(keySelector(x), keySelector(y));
       return comparison.AsComparer();
   }

   public static FunctorComparer<T> AsComparer<T>(this Comparison<T> comparison)
   {
       return new FunctorComparer<T>(comparison);
   }

}

sealed class FunctorComparer<T> : IEqualityComparer<T>, IComparer<T>
{
    readonly Comparison<T> _comparison;

    public FunctorComparer(Comparison<T> comparison)
    {
        _comparison = comparison;
    }

    public int Compare(T x, T y)
    {
        return _comparison(x, y);
    }

    public bool Equals(T x, T y)
    {
        return Compare(x, y) == 0;
    }

    public int GetHashCode(T obj)
    {
        return obj.GetHashCode();
    }
}
```

Now our key will be able to be used for both comparisons as equality.

Usage is quite simple!

```csharp
var set = list.Where(x => x.SomeCondition == true).ToSet(x => x.KeyProperty);
```
