---
layout: post
title: Resolving types while stripping down nullables
date: 2013-11-27 12:10:00
categories: [.NET, Helper, C#]
---

I'm currently working on a WPF project that uses advanced validation for their screens.

Each WPF control has a property that accepts a data type for the property you're binding it to. This datatype will be used during validation so illegal formats aren't filled in. (e.g. no strings when ints are expected, no ints when decimals are specified, etc...). We currently have a few metadata builders that simplify this process greatly by resolving types and setting them automatically.

There is one catch, though. <!--more-->When binding to a nullable property, the base type is used rather than the nullable type.

Coming up with a solution, was luckily not that hard. Rather than setting the datatype directly from the passed generic type, we added a little helper method. This method makes sure the correct type is always resolved.

```csharp
public static Type GetDataType<T>()
{
    return GetDataType(typeof (T));
}

public static Type GetDataType(Type type)
{
    return Nullable.GetUnderlyingType(type) ?? type;
}
```