var enable;
var userlist;
var current;



function remove_item(user) {
    chrome.storage.sync.get([window.current], function (result) {
        var userlist;
        var userlist_new;
        if (result[window.current] !== undefined) {
            userlist = result[window.current].split(",");
        } else {
            userlist = [];
        }
        var idx = userlist.indexOf(user);
        if (idx != -1) {
            userlist.splice(idx, 1);
        }
        userlist_new = userlist.join(",");
        var key = window.current;

        var params = {};
        params[key] = userlist_new;
        chrome.storage.sync.set(params);
        draw_list(userlist);
        var elements = Array.from(document.querySelectorAll('.im-mess-stack._im_mess_stack'));

        elements.forEach(function (item, key) {
            if (window.enabled && elements[key].children[1].children[0].children[0].children[0].href == user && elements[key].style.display == 'none') {
                item.style.display = 'block';
            }
        });



    });
}


function draw_block() {
    if (document.getElementById("ignore_list") === null) {
        var listitem = document.createElement('div');
        listitem.id = 'ignore_list';
        listitem.className = 'page_block im-right-menu ui_rmenu_pr ui_rmenu_sliding';
        listitem.style.position = 'fixed';
        listitem.style.bottom = '15px';
        listitem.style.marginLeft = '565px';
        listitem.style.width = '230px';
        listitem.innerHTML = '<span class=right_list_header>Список игнорируемых</span>';
        $("#content").children(".im-page-wrapper").append(listitem);
        $("#ignore_list").append("<div class=right_list id=right_list></div>");
    }
}

function hide_all(userlist) {
    var elements = Array.from(document.querySelectorAll('.im-mess-stack._im_mess_stack:not(.im-mess-stack_fwd)'));

    elements.forEach(function (item, key) {
        if (window.enabled && in_array(userlist, elements[key].children[1].children[0].children[0].children[0].href) > -1) {
            item.style.display = 'none';
        }
    });

    elements = Array.from(document.querySelectorAll('.im-mess-stack._im_mess_stack.im-mess-stack_fwd'));
    elements.forEach(function (item, key) {
        if (window.enabled && in_array(userlist, elements[key].children[1].children[0].children[0].children[0].href) > -1) {
            item.style.display = 'none';
        }
    });
}


function draw_list(list) {
    var userlist_search = [];
    var userlist_sstring;
    list.forEach(function (item) {
        userlist_search.push(item.substr(15));
    });
    userlist_sstring = userlist_search.join(",");

    $("#right_list").empty();
    $.ajax({
        url: "https://api.vk.com/method/users.get",
        type: "GET",
        data: ({"user_ids": userlist_sstring, "v": "5.52", "fields": "domain"}),
        success: function (msg) {
            msg.response.forEach(function (item) {
                var name = item.first_name + " " + item.last_name;
                var id = item.domain;
                $("#right_list").append("<div class='right_list_row clear_fix' style='color: #2a5885;'><a target=_blank href='https://vk.com/" + id + "'>" + name + "</a><span class='remove_ignore' data-id='https://vk.com/" + id + "' style='float:right'>X</span></div>");
            });
            $(document).find(".remove_ignore").bind("click", function () {
                var user = $(this).data("id");
                remove_item(user);
            });
        }
    });

}


chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (window.current != 0) {
                chrome.storage.sync.get([window.current], function (result) {
                    var userlist;
                    var userlist_new;
                    var current = window.current;
                    if (result[window.current] !== undefined) {
                        userlist = result[window.current].split(",");
                    } else {
                        userlist = [];
                    }
                    if (in_array(userlist, request.info.link) == -1) {
                        userlist.push(request.info.link);
                        userlist_new = userlist.join(",");
                        hide_all(userlist);

                        var key = current;

                        var params = {};
                        params[key] = userlist_new;
                        chrome.storage.sync.set(params);
                        draw_list(userlist);

                    }


                });
            }
        });


function chat_id() {
    var search = window.location.search.substr(1);
    var get = {};
    search.split('&').forEach(function (item) {
        item = item.split('=');
        get[item[0]] = item[1];
    });
    if (get["sel"] !== undefined && get["sel"].indexOf("c") == 0) {
        return get["sel"];
    } else {
        return 0;
    }
}

function in_array(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value)
            return i;
    }
    return -1;
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.enabled !== undefined) {
        window.enabled = changes.enabled.newValue;
        if (window.enabled) {
            chrome.storage.sync.get([window.current], function (result) {
                var userlist
                if (result[window.current] !== undefined) {
                    userlist = result[window.current].split(",");
                } else {
                    userlist = [];
                }
                draw_block();
                draw_list(userlist);
                hide_all(userlist);
            });
        } else {
            $("#ignore_list").detach();
            $(document).find('.im-mess-stack._im_mess_stack').filter(":hidden").show();
        }
    }
});





chrome.storage.sync.get(['enabled'], function (result) {
    var enabled = result["enabled"];
    window.enabled = enabled;
    window.current = chat_id();
    if (window.current != 0 && window.enabled) {
        draw_block();
        chrome.storage.sync.get([window.current], function (result) {
            var userlist
            if (result[window.current] !== undefined) {
                userlist = result[window.current].split(",");
            } else {
                userlist = [];
            }
            draw_list(userlist);
            hide_all(userlist);
        });
    }



    var target = document.querySelector('body');


    var observer = new MutationObserver(function (mutations) {
        if (window.enabled && window.location.href.indexOf('https://vk.com/im') + 1) {
            var chat = chat_id();
            if (chat != window.current) {
                window.current = chat;

                if (window.current != 0) {
                    draw_block();
                    chrome.storage.sync.get([window.current], function (result) {
                        var userlist;
                        if (result[window.current] !== undefined) {
                            userlist = result[window.current].split(",");
                        } else {
                            userlist = [];
                        }
                        $("#right_list").empty();
                        draw_list(userlist);
                        hide_all(userlist);
                    });
                } else {
                    $("#ignore_list").detach();
                }
            }


        }

        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0 && window.current != 0) {
                chrome.storage.sync.get([window.current], function (result) {
                    var userlist;
                    if (result[window.current] !== undefined) {
                        userlist = result[window.current].split(",");
                    } else {
                        userlist = [];
                    }

                    mutation.addedNodes.forEach(function (item, key) {

                        var elements = Array.from(document.querySelectorAll('.im-mess-stack._im_mess_stack.im-mess-stack_fwd'));
                        elements.forEach(function (item, key) {
                            if (window.enabled && in_array(userlist, elements[key].children[1].children[0].children[0].children[0].href) > -1) {
                                item.style.display = 'none';
                            }
                        });
                        if (mutation.addedNodes[key].className !== undefined) {
                            if (window.enabled && mutation.addedNodes[key].className.indexOf("im-mess-stack _im_mess_stack") + 1 && !(mutation.addedNodes[key].className.indexOf("im-mess-stack_fwd") + 1) &&
                                    in_array(userlist, mutation.addedNodes[key].children[1].children[0].children[0].children[0].href) > -1) {
                                item.style.display = 'none';
                            }
                        }


                    });
                });
            }
        });
    });

    var config = {childList: true, subtree: true}
    observer.observe(target, config);
    console.log("observer started");

});






