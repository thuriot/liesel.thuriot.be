---
layout: post
title: Automating your wake up alarm using Tasker
date: 2015-07-12 09:22:00
cover: //cdn.thuriot.be/images/Covers/Old-clock.jpg
categories: [Tasker, Automation, Android]
---

Setting your wake up alarm, you have two choices. Either you let it automatically wake you at a set time and let that alarm repeat, or you can do it manually which is a tedious and repetitive job. 

The choice seems obvious, just pick the first option! However, this can quickly turn out very annoying when you have a day off and forget shutting off the alarm. Having it wake you up at 6AM can easily turn your mood on what should be a fun day.

Since this has happened to me a few times, I decided to tinker something together using [Tasker](https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm&hl=en). This is an amazing Android app that allows you to automate anything, from Settings to SMS.

I created a `Task` that sets the alarm on weekdays and let the task trigger at 5 minutes after midnight. Inside the task, I used a variable for hours and minutes. This way I can easily adjust them, if needed, in Taskers `var` window. They are named `%AlarmHour` and `%AlarmMinute`. You could also create tasks to set these variables for you, depending on other conditions.

At this point, we've built an alarm that mimics the behaviour of option #1, the automatic alarm. So what about our vacation days? To solve this issue, I added an extra condition to the task to check my calendar. I have the tendency to add an all day event in my calendar named `Vacation` when I have a day off. So having it check if there is a `Vacation` task in my calendar is exactly what I needed. 

Now the task will only run on weekdays I don't have a day off. Perfect!


For your convenience, I exported the task. 
The generated xml, for those that want to import it, is as follows:

```xml
<TaskerData sr="" dvi="1" tv="4.7u1m">
    <Profile sr="prof7" ve="2">
        <cdate>1430336947272</cdate>
        <edate>1433861797349</edate>
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
            <Str sr="arg1" ve="3" />
            <Str sr="arg2" ve="3" />
            <Int sr="arg3" val="0" />
            <Str sr="arg4" ve="3" />
        </State>
        <Day sr="con2">
            <wday0>4</wday0>
            <wday1>6</wday1>
            <wday2>5</wday2>
            <wday3>3</wday3>
            <wday4>2</wday4>
        </Day>
    </Profile>
    <Task sr="task6">
        <cdate>1430336877555</cdate>
        <edate>1433861797349</edate>
        <id>6</id>
        <nme>Set Alarm</nme>
        <pri>10</pri>
        <Action sr="act0" ve="7">
            <code>566</code>
            <Int sr="arg0">
                <var>%AlarmHour</var>
            </Int>
            <Int sr="arg1">
                <var>%AlarmMinute</var>
            </Int>
            <Str sr="arg2" ve="3">Time for work!</Str>
            <Int sr="arg3" val="0" />
        </Action>
    </Task>
</TaskerData>
```