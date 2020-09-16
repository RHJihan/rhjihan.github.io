(function() {
           $('#toggle-event').change(function() {
              document.body.className = $(this).data($(this).prop("checked").toString());
           });   
         });
