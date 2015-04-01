function handleIframeHeight() {
  
  var updateHeight = function updateHeight() {
    var height = $( window ).height();
    var iframe = $( '.colorblind' );
    var iframeHeight = height - iframe.offset().top;
    
    iframe.css( 'height', iframeHeight + 'px' );
  }
  
  $( window ).resize( updateHeight );
  updateHeight();
  
}

function handleFormSubmit() {

  $( '#url-form' ).submit(function( event ) {
    event.preventDefault();
    var url = $( '#url-form .form-control' ).val();
    loadUrl( url );
  });
  
}

function loadUrl( url ) {
    
  if( -1 === url.indexOf( "://" ) ) {
    url = 'http://' + url;
  }
  
  $( 'iframe.colorblind' ).attr( 'src', url );
  jump( url );

}

function jump( anchor ) {

  var url = location.href;
  history.replaceState( null, null, url );
  location.hash = '#' + anchor;
  
}

$( function main() {
  
  handleIframeHeight();
  handleFormSubmit();
  
} );