# Mini eNAEP API
There are times that the captivate content will need to communicate with the eNAEP host. This is done by running Javascript in captivate actions. Common use cases include enabling and disabling toolbar buttons, changing themes and drawing scratchwork.

## How
In Captivate, click on an object in the timeline and then configure it's action to "Execute Javascript". This action is also available within the "Execute Advanced Actions" action.

Within the action you can add Javascript that will be executed on the page.

## Javascript Snippets
The following is example code that can be used in Javascript actions. Please note that some of them contain statements which send observable events. 

**Enable & Disable Manual Drawing**

```javascript
// disable
parent.window.enaepPlatform.scratchworkManager.disableDrawMode();

// enable
parent.window.enaepPlatform.scratchworkManager.enableDrawMode();
```

**Draw Scratchwork**

```javascript
// use setTimeout to add a delay of 1000
setTimeout(function(){
// check if the student has drawn anything
if (parent.window.enaepPlatform.scratchworkManager.wasAnyScratchworkActivityPerformed() === false)
	{
    // if they have not:
    // draw an ellipse & send observable event
    parent.window.enaepPlatform.scratchworkManager.drawEllipse(70, 412, 1016, 759);
    parent.window.enaepPlatform.recordObservable(95, 'InactDraw-ScrInt4');
	} else {
    // if they have:
    // don't draw anything - send observable
    parent.window.enaepPlatform.recordObservable(105,'CorrectEvent-ScrInt4');
	};
},1000);
```

**Change Theme**

```javascript
// change toolbar to the next theme
parent.window.enaepPlatform.changeTheme();
```

## Theming
Both captivate and mini-enaep must account for theming. Captivate must have themed versions of the content (e.g. the stimulus) and mini-enaep must be able to set themes on the toolbar. 

Captivate can control the theme for both the content and toolbar by using the advanced action editor. For the content, an action can be run to change the state of objects which inturn updates them to use the appropriate asset. A "Execute Javascript" action can be run to change the theme on the mini-enaep toolbar (see "Change Theme" snippet above).
