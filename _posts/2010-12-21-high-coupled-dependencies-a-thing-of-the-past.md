---
layout: post
title: Highly coupled dependencies, a thing of the past.
date: 2010-12-21 13:38:00
categories: [C#, Coupling, Injection, Depencency, IoC]
---

Programming 101, try to avoid highly coupled dependencies. Luckily, with today's frameworks, this has become a thing of the past.

First, what are highly coupled dependencies? To understand this, here's a little example:

```csharp
public interface MultiplierInterface
{
	public float GetMultiplier();
}

public class MultiplierImplementation : MultiplierInterface 
{
	public float GetMultiplier()
	{
		return 5f;
	}
}

public class Calculator {
	private MultiplierInterface multiplier = new MultiplierImplementation();

	public float Multiply(float number)
	{
		return number * multiplier.GetMultiplier();
	}
}
```

As you can see in this rather strange code sample, the *Calculator* class has a highly coupled dependency to the *MultiplierImplementation* class. I realise it's not a code sample you'll ever encounter in real life, but it works for showing what I'm talking about.

A better way to build the *Calculator* class would be to use a factory. *Calculator* would implement a constructor with the *Multiplier* interface as a parameter. The factory will then create an instance of a class implementing the *Multiplier* interface and pass it to the constructor of *Calculator*. This moves the dependency management from *Calculator* to the factory. As a consequence, if the <code>`Calculator`</code> needed to be assembled with a different *Multiplier* implementation, the *Calculator* code would not have to be changed. This is called dependency injection.

```csharp
public class CalculatorFactory
{
	public static Calculator BuildCalculator()
	{
		MultiplierInterface multiplier = new MultiplierImplementation();
		return new Calculator(multiplier);
	}
}
```

In a more realistic software application, this may happen if a new version of a base application is constructed with a different service implementation. Using factories, only the service code and the Factory code would need to be modified, but not the code of the multiple users of the service.

Creating all these factories can quickly become a lot of work, though. It's not called "manual dependency injection" for nothing. So, long story short, how to automate this process? It's simple! Use a dependency injection framework. In .NET, one of the better frameworks to do this is called [Ninject](http://ninject.org/). It's an amazing piece of code that takes care of any sort of dependency injection you would ever need. Simply get the latest dll, reference it in your project and stop worrying about highly coupled dependencies. At the time of this post, the latest Ninject version is v2.0.

Here's a little example how the above code would look when using the Ninject framework rather than self-made factories.

```csharp
public interface MultiplierInterface
{
    public float GetMultiplier();
}

public class MultiplierImplementation : MultiplierInterface {
    public float GetMultiplier()
    {
        return 5f;
    }
}

public class Calculator {
    private MultiplierInterface multiplier;

    public float Multiply(float number)
    {
        return number * multiplier.GetMultiplier();
    }

	[Inject]
	public Calculator(MultiplierInterface multiplier)
	{
		this.multiplier = multiplier;
	}
}

public class CalculatorModule : NinjectModule
{
	public override void Load()
	{
		Bind<MultiplierInterface>().To<MultiplierImplementation>();
		Bind<Calculator>().ToSelf();
	}
}

public class Program
{
	static void Main(string[] args)
	{
		IKernel kernel = new StandardKernel(new CalculatorModule());
		Calculator calculator = kernel.Get<Calculator>();
		//Logic implementation...
	}
}
```

As you can see, all you need to do is create a Ninject kernel and pass it all the modules you've created as parameters. Inside these modules, you declare the objects you want to place inside the kernel. Every object that gets injected or receives injects, needs to be declared. By simply putting the [Inject] attribute over *Calculator*'s constructor, Ninject will know it needs to inject it with an instance that implements *MultiplierInterface*. There are three possibilities when Ninject creates an instance of an object.

* There is one constructor with an Inject attribute. Ninject will use this constructor.
* There are multiple constructors but no Inject attributes are defined. Ninject will select the constructor with the most parameters that it understands to resolve.
* There are no constructors. Ninject will use the default constructor.

When injecting, Ninject will notice you've bound the *MultiplierImplementation* class to this interface. It will then create an instance of this class and pass it to *Calculator*'s constructor. All you need to do is ask the kernel for a *Calculator* and it will automate all the rest. It's as simple as that. You might also notice that the *ToSelf()* method is used when binding the Calculator class. This is simply because it does not have an interface in this example and it's a lot faster than writing it like this:

```csharp
Bind<Calculator>().To<Calculator>();
```

I, of course, realise real life isn't always that simple. Because of this, I've prepared two other, more complicated code samples to show how this framework works.

#First Ninject Sample

First, we will create an interface that our objects will use.

```csharp
public interface IRunnable
{
	void Run();
}
```

Second, we will create four objects that each implement this interface in a unique way.

```csharp
public class Runnable1 : IRunnable
{
	public void Run()
	{
		Console.Write("Hello");
	}
}
public class Runnable2 : IRunnable
{
	public void Run()
	{
		Console.Write(", ");
	}
}
public class Runnable3 : IRunnable
{
	public void Run()
	{
		Console.WriteLine("world");
	}
}
public class Runnable4 : IRunnable
{
	public void Run()
	{
		Console.WriteLine("!");
	}
}
```

We will also create a controller that contains one of each. Its constructor will obviously accept four *IRunnable* interfaces. This is where it gets tricky. How will Ninject know which object to pass?! Simply put, it doesn't. This is where attributes come in. We will create three attributes.

```csharp
public class FirstNinjectAttribute : Attribute { }
public class SecondNinjectAttribute : Attribute { }
public class ThirdNinjectAttribute : Attribute { }
```

These attributes will be used to make clear to Ninject which implementation should be used where. Without these attributes, it would simply create an instance of the first deceleration of the *IRunnable* interface four times and pass it to the constructor. This is, of course, not desirable in almost every case. We make it clear to Ninject which implementation belongs to which attribute in the *NinjectModule*.

And here it is:

```csharp
public class RunnableModule : NinjectModule
{
	public override void Load()
	{
		Bind<IRunnable>().To<Runnable1>();
		Bind<IRunnable>().To<Runnable2>().WhenTargetHas<FirstNinjectAttribute>();
		Bind<IRunnable>().To<Runnable3>().WhenTargetHas<SecondNinjectAttribute>();
		Bind<IRunnable>().To<Runnable4>().WhenTargetHas<ThirdNinjectAttribute>();
		Bind<NinjectController>().ToSelf().InSingletonScope();
	}
}
```

Our first runnable class gets declared without an attribute. If Ninject needs to pass a parameter typed *IRunnable* that does not have any of these attributes, it will pass an instance of *Runnable1*. We finally bind *NinjectController* to itself. Notice, however, that we're binding this class in singleton scope. Simply put, this means that every time you ask the kernel for a *NinjectController*, it will return that very same instance every time. This is quite desirable behaviour for a controller. Standard behaviour for Ninject is to create a new instance every time you call the Get method. It's the same as calling *.InTransientScope()* when binding the class. There are two other scopes available: Thread ( *.InThreadScope()* ) and Request ( *.InRequestScope()* ). Both are pretty straight forward. In thread scope, Ninject will create one instance per thread. In request scope, it will create one instance per web request. In the latter case, it will destroy that instance when the request ends.

Finally, here's the code for our controller:

```csharp
public class NinjectController
{
	private IRunnable testRunnable1;
	private IRunnable testRunnable2;
	private IRunnable testRunnable3;
	private IRunnable testRunnable4;

	[Inject]
	public NinjectController(IRunnable testRunnable1, [FirstNinject] IRunnable testRunnable2, [SecondNinject] IRunnable testRunnable3)
	{
		this.testRunnable1 = testRunnable1;
		this.testRunnable2 = testRunnable2;
		this.testRunnable3 = testRunnable3;
		this.testRunnable4 = null;
	}

	[Inject]
	public void SetRunnable4([ThirdNinject] IRunnable testRunnable)
	{
		this.testRunnable4 = testRunnable;
	}

	public void Run()
	{
		testRunnable1.Run();
		testRunnable2.Run();
		testRunnable3.Run();
		testRunnable4.Run();
	}
}
```

The first parameter will get an instance of the Runnable class that is defined without an attribute. The others will get an instance of those with the correct attribute. But wait, you say, the constructor doesn't have a parameter for the fourth runnable instance. What gives?! Won't running this result in the program throwing an exception?!

Well, this is another strength of Ninject. Notice that *Inject* attribute above the *SetRunnable4* method? That's right, it will call this method and pass the correct instance right after injecting the constructor, leaving us with a controller that has all 4 runnable classes filled in. Sweet!

Here's a main method to run this code sample:

```csharp
public class Program
{
	static void Main(string[] args)
	{
		IKernel kernel = new StandardKernel(new RunnableModule());
		NinjectController controller = kernel.Get<NinjectController>();
		controller.Run();
	}
}
```

The output of this will be **"Hello, world!"**.

#Second Ninject Sample

Okay, so now we know how to inject normal classes. So what if the class you want to inject has a parameter list of unknown length? And what if this parameter list is a list of *Strings* or other constants?

Let's create a few classes that will be injected. This sample will also be using the attributes we created in the previous sample.

```csharp
public class NinjectParams
{
	[Inject]
	public NinjectParams(params String[] strings)
	{
		foreach (String item in strings)
		{
			Console.WriteLine(item);
		}
	}
}

public class NinjectParamsWithFirstAttribute
{
	[Inject]
	public NinjectParamsWithFirstAttribute([FirstNinject] params String[] strings)
	{
		foreach (String item in strings)
		{
			Console.WriteLine(item);
		}
	}
}

public class NinjectParamsWithSecondAttribute
{
	[Inject]
	public NinjectParamsWithSecondAttribute([SecondNinject] params String[] strings)
	{
		foreach (String item in strings)
		{
			Console.WriteLine(item);
		}
	}
}

public class NinjectParamsWithBothAttributes
{
	[Inject]
	public NinjectParamsWithBothAttributes([FirstNinject, SecondNinject] params String[] strings)
	{
		foreach (String item in strings)
		{
			Console.WriteLine(item);
		}
	}
}
```

As you can see, each constructor has the *params* attribute and accepts *Strings*. In other words the constructor will accept an unlimited amount of *Strings*. Without the attributes, Ninject would just inject every *String* it can find. This is, of course, unwanted behaviour most of the time. Using attributes, we can control the behaviour.

The tricky part is creating the module which will be loaded in the kernel.

```csharp
public class ParamsModule : Ninject.Modules.NinjectModule
{
	public override void Load()
	{
		Bind<String>().ToConstant("First String");
		Bind<String>().ToConstant("Second String");
		Bind<String>().ToConstant("Third String will only be passed to FirstNinjectAttribute")
			.WhenTargetHas<FirstNinjectAttribute>();
		Bind<String>().ToConstant("Fourth String will only be passed to SecondNinjectAttribute")
			.WhenTargetHas<SecondNinjectAttribute>();
		Bind<String>().ToConstant("Fifth String");

		Bind<NinjectParams>().ToSelf();
		Bind<NinjectParamsWithFirstAttribute>().ToSelf();
		Bind<NinjectParamsWithSecondAttribute>().ToSelf();
		Bind<NinjectParamsWithBothAttributes>().ToSelf();
	}
}
```

Here's an example of the main function to use with this code.

```csharp
public class Program
{
	static void Main(string[] args)
	{
		IKernel kernel = new StandardKernel(new ParamsModule());
		kernel.Get<NinjectParams>();
		kernel.Get<NinjectParamsWithFirstAttribute>();
		kernel.Get<NinjectParamsWithSecondAttribute>();
		kernel.Get<NinjectParamsWithBothAttributes>();
	}
}
```

Now we come to the interesting part, what exactly will the output be?

*NinjectParams* will receive three *Strings*, namely the ones that were bound in the module without an attribute.

```csharp
{string[3]}
    [0]: "First String"
    [1]: "Second String"
    [2]: "Fifth String"
```

*NinjectParamsWithFirstAttribute* will receive four *Strings.* Each *String* without attribute will be injected because it fits the constructor, but also the *String* with the *FirstNinjectAttribute*. The *Strings* with an attribute have priority over others and will be injected first.

```csharp
{string[4]}
    [0]: "Third String will only be passed to FirstNinjectAttribute"
    [1]: "First String"
    [2]: "Second String"
    [3]: "Fifth String"
```

*NinjectParamsWithSecondAttribute* has similar behaviour, but will accept the *String* with the *SecondNinjectAttribute* rather than the first one.

```csharp
{string[4]}
    [0]: "Fourth String will only be passed to SecondNinjectAttribute"
    [1]: "First String"
    [2]: "Second String"
    [3]: "Fifth String"
```

Finally, *NinjectParamsWithBothAttributes* will receive all *Strings*.

```csharp
{string[5]}
    [0]: "Third String will only be passed to FirstNinjectAttribute"
    [1]: "Fourth String will only be passed to SecondNinjectAttribute"
    [2]: "First String"
    [3]: "Second String"
    [4]: "Fifth String"
```

Swapping the attributes in this last sample does not change the order in which they are injected. In other words, changing the attribute to "[SecondNinject, FirstNinject]" will make no difference. Ninject will inject in the order that the *Strings* are defined in the module. It doesn't really matter though if you define them in the module before or after the classes that will be injected in version 2 and up. In lower versions, Ninject will only inject things that are defined already, defining another *String* afterwards means it won't be injected.

However, I feel it's generally good practice to define the things that will be injected into others first. Best practice would be to completely separate them into different modules. One module for each type. (e.g. for this example: *StringsModule*, *NinjectParamsModule*, and so on). When splitting up the modules, it's a good idea to pass the modules like *StringModule* to the kernel's constructor first. This will help keep things easy to understand for both yourself and others.

Think things through before writing the module. The order might be important for your application.