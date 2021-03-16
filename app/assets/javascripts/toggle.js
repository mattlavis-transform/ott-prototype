var toggle_count = 2;

$(document).ready(function () {
    var toggle_state = 1;
    for (i = 1; i <= toggle_count; i++) {
        if (i == 1) {
            $(".toggle" + i.toString()).show();
        } else {
            $(".toggle" + i.toString()).hide();
        }
    }

    $(".teal").show();

    $(".hide").click(function (event) {
        $(this).parent().hide();
    });

    $("body").keydown(function (event) {
        if (event.target.tagName == "BODY") {
            if ((event.which == 84) || (event.which == 116)) {
                console.log("T key pressed. Toggle count is " + toggle_state);
                //console.log("toggle pressed. toggle_count = " + toggle_count);
                event.preventDefault();

                for (i = 1; i <= toggle_count; i++) {
                    $(".toggle" + i.toString()).hide();
                    if (toggle_state == i) {
                        $(".toggle" + i.toString()).show();
                    }
                }

                toggle_state = toggle_state + 1;
                toggle_state = toggle_state % toggle_count;
                if (toggle_state == 0) {
                    toggle_state = toggle_count;
                }
                if (toggle_state == 2) {
                    $(".teal").hide();
                } else {
                    $(".teal").show();
                }
            }
        }
    });

    $(".change_date").click(function (event) {
        if ($("#date_switcher").css('display') != 'none') {
            $("#date_switcher").hide();
        } else {
            $("#date_switcher").show();
        }
        event.preventDefault();
    });


    $(".cookie_accept_all").click(function (event) {
        document.cookie = "cookies_preferences_set=true; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/";
        $("#cookies_consent_mechanism").hide();
        $("#cookies_accepted").show();
        $("#cookies_rejected").hide();
        event.preventDefault();
    });

    $(".cookie_reject_all").click(function (event) {
        document.cookie = "cookies_preferences_set=true; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/";
        $("#cookies_consent_mechanism").hide();
        $("#cookies_accepted").hide();
        $("#cookies_rejected").show();
        event.preventDefault();
    });

    $(".hide_cookie_panel").click(function (event) {
        $(".app-cookie-banner").hide();
        event.preventDefault();
    });

    $(".cookies_save_changes").click(function (event) {
        $("#cookie-settings__confirmation").show();
        window.scrollTo(0, 0);
        event.preventDefault();
    });

});
