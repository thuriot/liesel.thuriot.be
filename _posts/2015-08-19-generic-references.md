---
layout: post
title: "Playing with Generic References: Hidden features of C#"
date: 2015-08-19 19:17:00
cover: //cdn.thuriot.be/images/Covers/reference.jpg
categories: [C#, unsafe, Generic, TypeReference]
---

When writing generic classes, it's highly likely you've gotten to the point (at least once) where you had to write a piece of type-specific code (wether due to third party or not) and you've done a type-check in one of your methods. Depending on the type of your generic parameter, you've then set a certain course of action.

Code smells aside, you've probably bumped into a casting issue at this point.

Imagine a generic class that holds some data.

```csharp
public class ClassWithData<T>
{
  T _value;

  // other stuff

  public byte[] GetBytes()
  {
    //Shit hits the fan if we want to stay in safe code...
    //and we'll do something like this:
    if (typeof(T) == typeof(int))
    {
      return BitConverter.GetBytes((int)_value);
    }
    else if (typeof(T) == typeof(double))
      //and so on ...
  }
}
```

Of course, this example won't even compile. The compiler won't let you cast to the generic type, even though you've verified it to be correct and in fact, the same! A cast which isn't really a cast in the first place.

Usually, we solve this by boxing the generic value first, and thus tricking the compiler.

```csharp
public class ClassWithData<T>
{
  T _value;

  // other stuff

  public byte[] GetBytes()
  {
    if (typeof(T) == typeof(int))
    {
      //Tricking the compiler!
      int value = (int)(object)_value;
      return BitConverter.GetBytes(value);
    }
    else if (typeof(T) == typeof(double))
      //and so on ...
  }
}
```

Bam! Code compiles, code works. Job done. Or is it? Not only are we tricking the compiler, we are also tricking ourselves... Doing this will box the generic value, moving it from the stack to the heap. This process is slow and should be avoided.

It's a problem (given you want to keep your code this way in the first place) that is actually easily solved. We can circumvent this by using a few of C#'s undocumented keywords: `__makeref` and `__refvalue`.

`__makeref` will create a `TypeReference`, while `__refvalue` will cast the reference to the type you pass it. No boxing and unboxing involved!

Implemented it would look like this:

```csharp
public class ClassWithData<T>
{
  T _value;

  // other stuffs

  public byte[] GetBytes()
  {
    if (typeof(T) == typeof(int))
    {
      var tr = __makeref(_value);
      int value = __refvalue(tr, int); //no typeof here..!
      return BitConverter.GetBytes(value);
    }
    else if (typeof(T) == typeof(double))
      //and so on ...
  }
}
```

I have noticed that it's rather picky with its casts, so be careful! For instance, if the type of `_value` is a `string`, and you're calling `__refvalue` with `object` as a type, it will throw an exception. Even though in normal code, that would work without any issues!

This definitely needs to be properly unit-tested when used in your project.

Enjoy, and don't forget to check back for more adventures later!
