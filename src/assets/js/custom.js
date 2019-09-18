	$(".js-height-full").height($(window).height());
        $(".js-height-parent").each(function(){
        $(this).height($(this).parent().first().height());
    });
	function count($this){
		var current = parseInt($this.html(), 10);
		current = current + 1; /* Where 50 is increment */
		
		$this.html(++current);
			if(current > $this.data('count')){
				$this.html($this.data('count'));
			} else {    
				setTimeout(function(){count($this)}, 50);
			}
		}        
		
		$(".stat-timer").each(function() {
		  $(this).data('count', parseInt($(this).html(), 10));
		  $(this).html('0');
		  count($(this));
	});
	$('#header').affix({
		offset: {
			top: 100,
			bottom: function() {
			return (this.bottom = $('.footer').outerHeight(true))
			}
		}
	})
	
	//turn textarea text red if over 1320 chars
	$(document).ready(function() {
        var char_limit = 1320;       
        $('#msg_text').bind('keyup', function() {
            new_length = $('#msg_text').val().length;
            if (new_length > char_limit) {
              $('#msg_text').css('color','red');
              $('#msg_length').css('color','red');
            } else {
               $('#msg_text').css('color', 'black');
               $('#msg_length').css('color','white');
            }
        });
 	});
 	//turn title text red if over 80 chars
	$(document).ready(function() {
        var char_limit = 80;       
        $('#sub_text').bind('keyup', function() {
            new_length = $('#sub_text').val().length;
            if (new_length > char_limit) {
              $('#sub_text').css('color','red');
              $('#sub_length').css('color','red');
            } else {
               $('#sub_text').css('color','black');
               $('#sub_length').css('color','white');
            }
        });
 	});