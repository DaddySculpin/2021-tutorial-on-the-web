var SHAREDSTYLESHEETFILENAME = "all-themes";

function SetThemeOnPageLoad(themeArray) 
{
    // Set click event for theme switcher button
    var $toolSwitchThemePresent = $("#student-toolbar").find("#toolSwitchTheme").first();
   
    if ($toolSwitchThemePresent.hasClass("hidden")) {
        return false;
    } else {
        $toolSwitchThemePresent.click(function () {
            if ($(this).hasClass('doNotClick')) {
                return false;
            }
            SwitchTheme(themeArray);
            return false;
        });
    }
}

function SetStylesheetForTheme(desiredTheme) {
	// Set link for theme styles (sprites)
	var $stylesheet = $("link").filter(function () {
		return $(this).attr("title") == "sprite-styles";
	}).first();

	if ($stylesheet.length) 
		$stylesheet.attr("href", "/content/styles/themes/" + desiredTheme + ".css");

	// Set the new theme
	$("#themeNumber").val(desiredTheme);
    // 
	var showTimerColor = "black";
    if (desiredTheme == "whiteBlack") {
        showTimerColor = "white";
    }
    SetEliminationButtonImageSource(desiredTheme);
    
    $(".timeLeft, .hasTimeLeft").css("color", showTimerColor);
    // add/remove theme stylesheet for eReader passages
	if ($("#eReader").length) {
	    SetStimulusTheme();
	}
    //Call Observable Event for Theme Change
    window.ObservableEvent.AddObservableEvent(window.OBSERVABLETYPES.CHANGETHEME, $.trim($("#currentBlockId").val()), $.trim($("#currentItemId").val()), null, desiredTheme);
}

function SwitchTheme(themeArray) 
{
    // If there is no theme saved, then the current theme must be the default theme.
    var currentTheme = "";
    if ($("#themeNumber").val().length > 0) {
        currentTheme = $.trim($("#themeNumber").val());
    } else {
        currentTheme = themeArray[0];
        $("#themeNumber").val(currentTheme);
    }
	var newTheme = themeArray[0];
	if (currentTheme != themeArray[themeArray.length - 1]) 
	{
		for (var i = 0; i < themeArray.length - 1; i++) 
		{
			if (currentTheme == themeArray[i]) 
			{
				newTheme = themeArray[i + 1];
			}
		}
	}

	SetStylesheetForTheme(newTheme);
	if (typeof (UpdateCanvas) != 'undefined') {
	    setTimeout(function () { UpdateCanvas(); }, 1000);
	}
    return false;
}

function SetEliminationButtonImageSource(themeNumber) {
    if (themeNumber != '') {
        $("img.EliminationMinus").attr('src', '../../content/images/student/' + themeNumber + '_Elimination_Minus.png');
        $("img.EliminationPlus").attr('src', '../../content/images/student/' + themeNumber + '_Elimination_Plus.png');
    } else {
        $("img.EliminationMinus").attr('src', '../../content/images/student/brushed_Elimination_Minus.png');
        $("img.EliminationPlus").attr('src', '../../content/images/student/brushed_Elimination_Plus.png');
    }
}