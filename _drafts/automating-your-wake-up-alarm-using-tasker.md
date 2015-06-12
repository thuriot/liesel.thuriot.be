---
layout: post
title: Automating your wake up alarm using Tasker
date: 2014-12-30 15:02:00
cover: http://cdn.thuriot.be/Covers/NESRemote.png
categories: [Tasker, Automation, Android]
---


The generated xml, for those that want to import the task, is as follows:

```xml
<TaskerData sr="" dvi="1" tv="4.6u3m">
	<Profile sr="prof7" ve="2">
		<cdate>1430336947272</cdate>
		<edate>1430729376803</edate>
		<id>7</id>
		<mid0>6</mid0>
		<nme>Set Alarm On Weekdays</nme>
		<Time sr="con0">
			<fh>0</fh>
			<fm>5</fm>
			<th>0</th>
			<tm>5</tm>
		</Time>
		<State sr="con1" ve="2">
			<code>5</code>
			<pin>true</pin>
			<Str sr="arg0" ve="3">Vacation</Str>
			<Str sr="arg1" ve="3"/>
			<Str sr="arg2" ve="3"/>
			<Int sr="arg3" val="0"/>
			<Str sr="arg4" ve="3"/>
		</State>
		<Day sr="con3">
			<wday0>4</wday0>
			<wday1>5</wday1>
			<wday2>6</wday2>
			<wday3>2</wday3>
			<wday4>3</wday4>
		</Day>
	</Profile>

	<Task sr="task6">
		<cdate>1430336877555</cdate>
		<edate>1430487019209</edate>
		<id>6</id>
		<nme>Set Alarm</nme>
		<Action sr="act0" ve="7">
			<code>566</code>
			<Int sr="arg0" val="6"/>
			<Int sr="arg1" val="45"/>
			<Str sr="arg2" ve="3">Time for work!</Str>
			<Int sr="arg3" val="0"/>
		</Action>
	</Task>
</TaskerData>
```