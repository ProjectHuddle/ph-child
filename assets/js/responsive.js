(function ($) {

    PHResponsiveHandler = {
        init: function () {
            if( ! $( 'body' ).hasClass('ph-responsive-mode') ) {
				return;
			}
            this._bindEvents();
            PHResponsiveHandler._onLoadShowResponsive();
        },

        _onLoadShowResponsive: function () {
            tb_show( document.title, window.location.origin + 'TB_iframe=true', '' );

			$('#TB_window')
				.addClass('cartflows-thickbox-loading')
				.addClass('desktop');

			$('#TB_closeAjaxWindow').prepend( wp.template('cartflows-responsive-view') );
        },

        _bindEvents: function () {
            var self = PHResponsiveHandler;
	
			$( document ).on('click', '.actions a', 	self._previewResponsive );
			$( 'body' ).on('thickbox:iframe:loaded', 	self._previewLoaded );
			$( 'body' ).on('thickbox:removed', 			self._previewClose );
        },

        _previewResponsive: function( event ) {

			event.preventDefault();

			var icon = $(this).find('.dashicons');

			var viewClass = icon.attr('data-view') || '';

			$('#TB_window').removeClass( 'desktop tablet mobile' );
			$('#TB_window').addClass( viewClass );

			$('.actions .dashicons').removeClass('active');
			icon.addClass('active');

			$('#TB_iframeContent').removeClass();
			$('#TB_iframeContent').addClass( viewClass );
		},

        _previewLoaded: function( event ) {
			
		},

        _previewClose: function( event )
		{
			event.preventDefault();
			window.top.close();
		},
    };

    
	$(function(){
		PHResponsiveHandler.init();
	});
    
})(jQuery);