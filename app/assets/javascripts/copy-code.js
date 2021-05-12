$(function () {
    $("#copy_comm_code").click(function (event) {
        copyToClipboard("4103900000");
        // $(this).text("Commodity code copied");
        // $(this).removeAttr("href");
        // $(this).removeClass("pseudo-link");
        // $(this).fadeOut(750)
        $(".copied").css("display", "block");
        //$(".copied").show();
        $(".copied").delay(500).fadeOut(900);
        event.preventDefault();
    });

    function copyToClipboard(text) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }

});