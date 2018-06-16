 $('#confirm-delete').on('show.bs.modal', function(e) {
    $(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
});
$( ".alert" ).fadeTo(2000, 500).slideUp(500, function(){
    $(".alert").slideUp(500);
});