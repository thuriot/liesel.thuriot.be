---
layout: post
title: "WPF: A Model First Approach"
date: 2014-12-03 19:05:00
cover: //cdn.thuriot.be/images/Covers/wpf.jpg
categories: [Model First, .NET, WPF]
---

The usual approach, when building a WPF application, even when using a `ViewModel`, fact remains that the views are rather tightly coupled by the model you're using. 

Don't get me wrong though, a well built application will still be easy to adjust when the model changes. But here's the catch, it won't be an unusual scenario having to slightly adjust your view when reworking your model.

##Imagine the following scenario

You have a property on your model indicating wether you're in a relationship. This seems pretty straightforward and you've always modeled this by using a boolean value on your model. On the view, you've placed a checkbox. Simple `yes/no` question, right?

However, Facebook and others have already shown us that a lot of people don't have a `yes/no` answer to this question. If we want to follow in Facebook's steps, we will have to use a `ComboBox` instead with values like `Yes`, `No` and `It's Complicated`.

After having adjusted our model, the boolean has disappeared and probably been replaced with an `enum` or even a `string` value. The CheckBox no longer suffices, so after this change we'll have to adjust our view as well by changing the type from CheckBox to ComboBox.

This is a hassle and can quickly pull you out of the zone while programming and refactoring.

#Approaching from a different angle

##What if...
...instead of adjusting the view to your model, the view is automatically build depending on the model attached to it?

That would mean that in our previous sample, a bit of mark up would have to be changed and the view would automatically adjust. This would also mean that a view can be used again with a different model and adjust to it enough to make it seem like it was built just for that model.

Taking it a step further, this metadata could even be retrieved from a database at program startup. That would make it possible to change your view completely by adjusting a few fields in your online database, e.g. changing from a simple TextBox to a ComboBox with preset values.

Having loved the idea behind this for ages now, I've worked on a little WPF framework that does just the thing!

Here's a small preview of a view completely built up from the model.
![Nova Bindings](https://cloud.githubusercontent.com/assets/544444/5234817/8cb922ac-77dd-11e4-801d-bcf6bad9e994.png)

##So how do we use it?

###Including and referencing 
First step, get a dll from my GitHub repo: [Nova.Bindings](https://github.com/StevenThuriot/Nova.Bindings).

Second, merge Nova.Bindings' `ResourceDictionary` into your app's dictionary.

```xml
<ResourceDictionary.MergedDictionaries>
        <ResourceDictionary Source="pack://application:,,,/Nova.Bindings;component/ValueEditor.xaml" />
</ResourceDictionary.MergedDictionaries>
```

###Views
After doing this, views become as simple as using TextBlock/Labels and ValueEditors, combined with a special Binding.
It will be the only editor you'll ever use again!

A change in the model? No problem! The Bindings will take care of it for you!

```xml
<TextBlock   Grid.Column="0" Text="{LabelFor Model.Property}" />
<ValueEditor Grid.Column="1" Value="{ValueBinding Model.Property}" />
```

The `LabelFor` binding has a property `AppendColon`, default `true`, which will append a colon to the label.

The `ValueBinding` binding has two properties that can be set:

* Mode ( == BindingMode, default value is BindingMode.Default )
* Converter ( Default null )

####Implementation

Implement IHaveSettingsManager on your ViewModel.
The bindings will try to resolve this Manager (from the control up) to try and find the control's settings.

####ViewModel

```csharp
public class ViewModel : IHaveSettingsManager
{
	public ISettingsManager SettingsManager { get; private set; }
	
	public ViewModel()
	{
		SettingsManager = new NovaSettingsManager();
	}
}
```

####Settings Manager

Next, create a settings manager.

```csharp
public class NovaSettingsManager : ISettingsManager
{
	private readonly Dictionary<string, IDefinition> _definitions;
	private readonly DefinitionFactory _factory;
	
	public NovaSettingsManager()
	{
		_definitions = new Dictionary<string, IDefinition>();
		
		//TODO;
		_factory = new ComboBoxFactory(); //Good starter since it's a special case.
		_factory.SetSuccessor<RadioButtonFactory>()
			    .SetSuccessor<CheckBoxFactory>()
			    .SetSuccessor<DatePickerFactory>()
			    //.......... 
			    .SetSuccessor<TextBoxFactory>(); //Decent Fallback in case nothing matches.
	}
	
	public IDefinition GetDefinition(string id)
	{
		IDefinition definition;
		
		if (_definitions.TryGetValue(id, out definition))
		{
			return definition;
		}
		
		definition = _factory.Create(id);
		_definitions.Add(id, definition);
		return definition;
	}
}


//Sample [Chain Of Responsilibity](https://www.dofactory.com/net/chain-of-responsibility-design-pattern)
abstract class DefinitionFactory
{
	protected DefinitionFactory _successor;
	
	public DefinitionFactory SetSuccessor(DefinitionFactory successor)
	{
		return _successor = successor;
	}

	public DefinitionFactory SetSuccessor<T>()
		where T : DefinitionFactory, new()
	{
		return _successor = new T();
	}
	
	public IDefinition Create(string id)
	{
		var definition = CreateDefinition(id);
		
		if (definition != null)
			return definition;
		
		if (_successor != null)
		{
			definition = _successor.Create(id);
			
			if (definition != null)
				return definition;
		}
		
		throw new NotSupportedException(id);
	}
	
	protected abstract IDefinition CreateDefinition(string id);
}
```

####Meta Data

The id the `GetDefinition` method receives is determined by the metadata you have to place on the model. (Hence **model first**)
This is done by adding attributes.

```csharp
[Settings("PersonName")]
public string Name { get; set;}
```

In this specific case, the id will be *PersonName*.
Sometimes, fields can have multiple definitions, depending on the situations. Imagine a class where a second property determins if the decorated property is shown as a combobox or a normal text field. This can't be decorated by a simple attribute.

In this case, we can use a second provided attribute.

```csharp
[DynamicSettings("SomeDynamicProperty")]
public string Property { get; set;}
```

When using `Dynamic Settings`, the class that has said property _must_ implement `IHaveDynamicPropertySettings`.

```csharp
public class Model : IHaveDynamicPropertySettings
{
	public string ProvideDynamicSettings(string field)
	{
		if (field == "SomeDynamicProperty")
		{
			if (SecondProperty == "Something")
			{
				return "PersonName";
			}
			else
			{
				return "PersonList";
			}
		}
		
		return field;
	}
}
```

The string returned will be the id used in the settings manager to find the correct `IDefinition`.

####Definitions

#####Default

A definition has the following properties:

```csharp
public interface IDefinition
{
	string Id { get; }
	string Label { get; }
	string Editor { get; }
}
```

* `Id` is the id from the `GetDefinition` method.
* `Label` is the text used for the `LabelFor` extension.
* `Editor` is the type of editor that needs to be used.
 
This will do for most settings. Two control types require a specific interface to be implemented;

#####ComboBox

```csharp
public interface IComboBoxDefinition : IDefinition
{
    IEnumerable ItemsSource { get; }
}
```

#####RadioButton

```csharp
public interface IRadioButtonDefinition : IDefinition
{
    string GroupName { get; }
}
```

To make life easier, constants are available! The `Editor` is defined as a string rather than an enum to make it easier to add your own implementations!

```xml
Nova.Bindings.ValueEditor.Definitions.ValueTextEditor
Nova.Bindings.ValueEditor.Definitions.ValueCheckBoxEditor
Nova.Bindings.ValueEditor.Definitions.ValueRadioButtonEditor
Nova.Bindings.ValueEditor.Definitions.ValueComboBoxEditor
```

####Templates

A template can easily be added by adding a similar template into the App's Resource Dictionary. Samples can be found [here](https://github.com/StevenThuriot/Nova.Bindings/blob/master/Nova.Bindings/ValueEditor.xaml).

Note that the Template keys are the same as the Editor constants that IDefinition supplies!

```xml
<ControlTemplate x:Key="ValueTextEditor" TargetType="n:ValueEditor">
    <TextBox x:Name="PART_ValueEditor"
             Text="{Binding Value, RelativeSource={RelativeSource TemplatedParent}, Mode=TwoWay}" />
</ControlTemplate>
```
