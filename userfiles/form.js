// Stop AJAX caching 
$.ajaxSetup({ cache:false });
$(function() {
    // 1 When someone clicks on the button...
    $("form").submit(function() {
        var username = $('input:first').val();

           $.ajax({
                url: 'http://localhost:3000',
                data: {username: username},
                method: 'POST',
                dataType: 'jsonp',
                jsonp: 'callback',
                jsonpCallback: 'jsonpCallback',
                success: function(data){
                    console.log(data);
                    // 5.4 Display messages
                    $('h3#message').html('Hello there @' + data.username + '!');   
                    $('p#distance').html('Number of checkins: ' + data.checkIns)

                }
            });
        return false;
    })
    // Allow form to submit without reloading the page 
});
  