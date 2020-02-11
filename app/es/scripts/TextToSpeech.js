var enaep = enaep || {};

(function () {
    'use strict';

    var componentsShouldBeRead = [
        'div.paragraph', 'div.choice_paragraph', 'div.stem_paragraph', 'div.passage_para', 'div.block-end-review-screen', 'li.draggable_element',
        'ul.unordered_list', 'div#ThankyouText', 'div#CopyrightText', 'html_fragment>p', 'html_fragment>div>p', 'div.helpContent',
        'div#helpBookletNumber', 'span.helpContent', 'div.span.stressed', 'th>div', 'td>div', 'img.source_image', 'img.standalone_image', 'img.inline_image', 'img.background_image',
        'div.standalone_quote', 'div.displayInline', 'html_fragment>ul>li', 'div.numeric_entry_paragraph'
    ];

    var helpComponentsShouldBeRead = ['div.helpContent', 'div#helpBookletNumber', 'span.helpContent'];

    var componentsShouldNotBeRead = ['script'];

    var classToAdd = 'componentsCanBeRead';
    var borderClassToAdd = 'ttsBorder';

    function applyTTS(components) {

        $.each(components, function(index, tag) {
            //console.info('Read Aloud: Processing ', tag);

            if ($.trim($($(tag)).text()).indexOf('<math') !== 0) 
            {
                if (tag === 'div.block-end-review-screen') {
                    // this is Review Tab , it has <p> and <li> tags.
                    var ptagsInReviewTab = $(tag).find("p");
                    $.each(ptagsInReviewTab, function(pindex, ptag) {
                        if ($.trim($($(ptag)).text()).length > 0) {
                            $(ptag).addClass(classToAdd);
                        }
                    });

                    var litagsInReviewTab = $(tag).find("li");
                    $.each(litagsInReviewTab, function(liindex, litag) {
                        if ($.trim($($(litag)).text()).length > 0) {
                            $(litag).addClass(classToAdd);
                        }
                    });
                } else if (tag === 'img.standalone_image' || tag === 'img.inline_image' || tag === 'img.background_image' || tag === 'img.source_image') {
                    if ($(tag).length >= 0) {
                        $.each($(tag), function(imageIndex, imagevalue) {
                            var altTextOfImage = $(imagevalue).attr('alt');
                            if (altTextOfImage.length > 0) {
                                $(imagevalue).addClass(classToAdd);
                            }
                        });
                    }
                } else if (tag === 'div.displayInline') {
                    if ($(tag).length > 0) {
                        $.each($(tag), function (tagIndex, tagvalue) {
                            if ($.trim($($(tagvalue)).text()).length > 0) {
                                if ($(tagvalue).parent('.stem_paragraph').length <= 0) {
                                    $(tagvalue).addClass(classToAdd);
                                } 
                            }
                        });
                    }
                } else {
                    if ($(tag).length > 0) {
                        $.each($(tag), function(tagIndex, tagvalue) {
                            if ($.trim($($(tagvalue)).text()).length > 0) {
                                if ($.trim($($(tagvalue)).html()).indexOf('<math') !== 0) {
                                    $(tagvalue).addClass(classToAdd);
                                }
                            }
                        });
                    }
                }
            }
        });
        //Clean up
        $('.passage_para').find('img.inline_image').removeClass(classToAdd);
        $('.stem_paragraph').find('img.inline_image').removeClass(classToAdd);
        $('.passage_para').find('div.displayInline').removeClass(classToAdd);
        $('.unordered_list').find('div.displayInline').removeClass(classToAdd);


        //var eItem = $("div#ContentArea").find('.eliminated');
        //for (var i = 0; i < eItem.length ; i++) {
        //    $(eItem[i]).closest('label').removeClass('eliminated')
        //}
      
        var components = $('.' + classToAdd);

        ////add ng-click attribute at end to match index
        //$.each(componentsThatCanBeRead, function(index, value) {
        //    $(this).attr('ng-click', 'readComponent(' + index + ')');
        //});

        return components;
    }

    function applyTtsStyleToContentArea() {

        var itemsRadio = $("div#ContentArea").find(' input:radio');
        var itemsCheck = $("div#ContentArea").find(' input:checkbox');
        var itemsDraggableImage = $("#draggable_container").find('img.source_image');
        var itemsDroppableImage = $(".draggable_element").find('img.source_image');
        var itemsEquationAreas = $(".wrs_focusElement");
        var itemsTextInput = $("div#ContentArea").find('input:text');
        var itemsTextarea = $("div#ContentArea").find('textarea');
        var itemsEliminationButton = $("div#ContentArea").find('.mc-eliminate-choice');
        var itemsClearAnswer = $("div#ContentArea").find('.reset_button');
        angular.forEach(itemsRadio, function (value, key) {
            $(value).attr('disabled', 'disabled');
        });
        angular.forEach(itemsCheck, function (value, key) {
            $(value).attr('disabled', 'disabled');
        });
        angular.forEach(itemsEquationAreas, function(value, key) {
            $(value).attr('disabled', 'disabled');
        });
        angular.forEach(itemsTextInput, function (value, key) {
            $(value).addClass('pointerEventsNone').attr('readonly','readonly');
        });
        angular.forEach(itemsTextarea, function (value, key) {
            $(value).addClass('pointerEventsNone').attr('readonly', 'readonly');
        });
        angular.forEach(itemsEliminationButton, function (value, key) {
            $(value).attr('disabled', 'disabled');
        });
        angular.forEach(itemsClearAnswer, function (value, key) {
            $(value).attr('disabled', 'disabled');
        });

        if (angular.element('#helpArea').length) {
            return applyTTS(helpComponentsShouldBeRead);
        } else {
            return applyTTS(componentsShouldBeRead);
        }
    };

    function applyTtsStyleToDialogArea() {
         
        if (angular.element('#dialogItemContentArea').length) {
            var itemsDialogPs = $("div#dialogItemContentArea").find("p");
            $.each(itemsDialogPs, function (pindex, ptag) {
                if ($.trim($($(ptag)).text()).length > 0) {
                    $(ptag).addClass(classToAdd);
                }
            });
              var components = $('.' +classToAdd);
                   return components;
        }
        return null;
    };

    function removeTtsStyleFromContentArea() {

        var itemsRadio = $("div#ContentArea").find(' input:radio');
        var itemsCheck = $("div#ContentArea").find(' input:checkbox');
        var itemsDraggableImage = $("#draggable_container").find('img.source_image');
        var itemsDroppableImage = $(".draggable_element").find('img.source_image');
        var itemsEquationAreas = $(".wrs_focusElement");
        var itemsTextInput = $("div#ContentArea").find('input:text');
        var itemsTextarea = $("div#ContentArea").find('textarea');
        var itemsEliminationButton = $("div#ContentArea").find('.mc-eliminate-choice');
        var itemsClearAnswer = $("div#ContentArea").find('.reset_button');
        angular.forEach(itemsRadio, function (value, key) {
            if ((value).hasAttribute('disabled')) {
                angular.element(value).removeAttr('disabled');
            }
        });
        angular.forEach(itemsCheck, function (value, key) {
            if ((value).hasAttribute('disabled')) {
                angular.element(value).removeAttr('disabled');
            }
        });
        angular.forEach(itemsEquationAreas, function (value, key) {
            if ((value).hasAttribute('disabled')) {
                angular.element(value).removeAttr('disabled');
            }
        });
        angular.forEach(itemsTextInput, function (value, key) {
            $(value).removeClass('pointerEventsNone').removeAttr('readonly');
        });
        angular.forEach(itemsTextarea, function (value, key) {
            $(value).removeClass('pointerEventsNone').removeAttr('readonly');
        });
        angular.forEach(itemsEliminationButton, function (value, key) {
            $(value).removeAttr('disabled');
        });
        angular.forEach(itemsClearAnswer, function (value, key) {
            $(value).removeAttr('disabled');
        });
        var itemsDialogPs = $("div#dialogItemContentArea").find("p");
        angular.forEach(itemsDialogPs, function (value, key) {
            if ($(value).hasClass(classToAdd)) {
                $(value).removeClass(classToAdd);
            }
        });

        var items1 = $("div#ContentArea").find('.' + classToAdd);
        var items2 = $("div#helpArea").find('.' + classToAdd);
        
        items1.removeClass(classToAdd);
        //items1.removeAttr('ng-click');

        items2.removeClass(classToAdd);
        //items2.removeAttr('ng-click');

        angular.forEach(items1, function(value, key) {
            if (value.hasAttribute('ng-click')) {
                value.removeAttribute('ng-click');
            };
    });

        angular.forEach(items2, function(value, key) {
            if (value.hasAttribute('ng-click')) {
                value.removeAttribute('ng-click');
    };
    });

        //return items1;

        //var eItem = $("div#ContentArea").find('.eliminated');
        //for (var i = 0; i < eItem.length ; i++) {
        //    $(eItem[i]).parent().parent().find('Label').addClass('eliminated')
        //}
    }

    function applyInvisibleTtsBorderToContent() {

        var components = [];
        components.push(helpComponentsShouldBeRead);
        components.push(componentsShouldBeRead);
       
        $.each(components, function(key, item) {
            $.each(item, function (index, tag) {

                if ($.trim($($(tag)).text()).indexOf('<math') !== 0) {
                    if (tag === 'div.block-end-review-screen') {
                        // this is Review Tab , it has <p> and <li> tags.
                        var ptagsInReviewTab = $(tag).find("p");
                        $.each(ptagsInReviewTab, function (pindex, ptag) {
                            if ($.trim($($(ptag)).text()).length > 0) {
                                $(ptag).addClass(borderClassToAdd);
                            }
                        });

                        var litagsInReviewTab = $(tag).find("li");
                        $.each(litagsInReviewTab, function (liindex, litag) {
                            if ($.trim($($(litag)).text()).length > 0) {
                                $(litag).addClass(borderClassToAdd);
                            }
                        });
                    } else if (tag === 'img.standalone_image' || tag === 'img.inline_image' || tag === 'img.background_image' || tag === 'img.source_image') {
                        if ($(tag).length >= 0) {
                            $.each($(tag), function (imageIndex, imagevalue) {
                                var altTextOfImage = $(imagevalue).attr('alt');
                                if (altTextOfImage.length > 0) {
                                    $(imagevalue).addClass(borderClassToAdd);
                                }
                            });
                        }
                    } else if (tag === 'div.displayInline') {
                        if ($(tag).length > 0) {
                            $.each($(tag), function (tagIndex, tagvalue) {
                                if ($.trim($($(tagvalue)).text()).length > 0) {
                                    if ($(tagvalue).parent('.stem_paragraph').length <= 0) {
                                        $(tagvalue).addClass(borderClassToAdd);
                                    }
                                }
                            });
                        }
                    } else {
                        if ($(tag).length > 0) {
                            $.each($(tag), function (tagIndex, tagvalue) {
                                if ($.trim($($(tagvalue)).text()).length > 0) {
                                    if ($.trim($($(tagvalue)).html()).indexOf('<math') !== 0) {
                                        $(tagvalue).addClass(borderClassToAdd);
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
        $('.passage_para').find('img.inline_image').removeClass(borderClassToAdd);
        $('.stem_paragraph').find('img.inline_image').removeClass(borderClassToAdd);
        $('.passage_para').find('div.displayInline').removeClass(borderClassToAdd);
        
    }
    
//enaep.applyTtsStyleToContentArea = applyTtsStyleToContentArea;
    //enaep.removeTtsStyleFromContentArea = removeTtsStyleFromContentArea;

    window.applyTtsStyleToDialogArea = applyTtsStyleToDialogArea;
    window.applyTtsStyleToContentArea = applyTtsStyleToContentArea;
    window.removeTtsStyleFromContentArea = removeTtsStyleFromContentArea;
    window.applyInvisibleTtsBorderToContent = applyInvisibleTtsBorderToContent;
}());
