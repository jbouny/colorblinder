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

function handleAbnormalityMenu() {

  $( '#abnormality-menu li a' ).click( function( event ) {
    event.preventDefault();
    
    var key = $( this ).attr( 'key' );
    loadFilter( key );
    $( '#abnormality-menu .dropdown-toggle span' ).html( $( this ).html() );
  } ) ;
  
}

function loadFilter( filter ) {
  
  var element = $( '.colorblind' );
  var value = 'none' === filter ? '' : 'url(colorblindness.svg#' + filter + ')';
  
  element.css( 'filter', value );
  element.css( '-webkit-filter', value );
  
}

function loadUrl( url ) {
   
  if( -1 === url.indexOf( "://" ) ) {
    url = 'http://' + url;
  }
  
  $( '#url-form .form-control' ).val( url );
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
  handleAbnormalityMenu();
  
  loadFilter( 'none' );
  loadUrl( 'https://duckduckgo.com/?q=color&iax=1&ia=images' );
  
} );