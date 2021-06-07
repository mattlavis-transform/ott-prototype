$(document).ready(function () {
    $(".hide").click(function (event) {
        $(this).parent().hide();
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
