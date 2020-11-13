var toggle_count = 3;

$(document).ready(function () {
    var toggle_state = 1;
    for (i = 1; i <= toggle_count; i++) {
        if (i == 1) {
            $(".toggle" + i.toString()).show();
        } else {
            $(".toggle" + i.toString()).hide();
        }
    }

    $("body").keydown(function (event) {
        if ((event.which == 84) || (event.which == 116)) {
            console.log("toggle pressed. toggle_count = " + toggle_count);
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
        }
    });

});
