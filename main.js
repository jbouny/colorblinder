$( function main() {
  
  var updateHeight = function updateHeight() {
    var height = $( window ).height();
    var iframe = $( '.colorblind' );
    var iframeHeight = height - iframe.offset().top;
    
    iframe.css( 'height', iframeHeight + 'px' );
  }
  
  $( window ).resize( updateHeight );
  updateHeight();
  
} );