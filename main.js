var g_DomParser = new DOMParser(),
    g_Container,
    g_CurrentFilter;
    
function updateHeight() {
  var height = $( window ).height();
  var iframeHeight = height - g_Container.offset().top;
  
  g_Container.css( 'height', iframeHeight + 'px' );
}

function handleIframeHeight() {
  
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
    
    g_CurrentFilter = $( this ).attr( 'key' );
    loadFilter();
    $( '#abnormality-menu .dropdown-toggle span' ).html( $( this ).html() );
  } ) ;
  
}

function loadFilter() {
  
  var value = 'none' === g_CurrentFilter ? '' : 'url(colorblindness.svg#' + g_CurrentFilter + ')';
  
  g_Container.css( 'filter', value );
  g_Container.css( '-webkit-filter', value );
  
}

function doAjax( url, container ) {

  var urlParent = url;
  if( url.indexOf( '://' ) !== -1 ) {
  
    var indexOfProtocol = url.indexOf( '://' ) + 3;
    urlParent = url.substr( indexOfProtocol, url.length - indexOfProtocol );
    if( urlParent.lastIndexOf( '/' ) !== -1 ) {
      urlParent = urlParent.substr( 0, urlParent.lastIndexOf( '/' ) );
    }
    urlParent = url.substr( 0, indexOfProtocol ) + urlParent;
  }
    
  var filterData = function filterData( data ) {
  
    data = data.replace( new RegExp('(href|src)="/', 'g' ),  '$1="'+urlParent+'/' );
    return data;
    
  }
  
  var setContent = function setContent( data ) {
  
    var doc = container[0];
    
    if( doc.contentDocument ) {
      doc = doc.contentDocument;
    }
    else if( doc.contentWindow ) {
      doc = doc.contentWindow.document;
    }
    
    doc.open();
    doc.writeln( data );
    doc.close();
    
  };
  
	if( url.match( '^http' ) ) {
    var content = '';
    
    var loadContentWithYahoo = function( url, successCallback, failCallback ) {
    
      var statement = 'select * from html where url="' + url + '" and xpath="//html"';
      $.queryYQL( statement, 'xml', undefined, function ( data ) {
        
        if( data.results[0] ) {
          successCallback( data.results[0] );
        }
        else {
          failCallback();
        }
        
      } );
    }
    
    var loadContentWithWhateverOrigin = function( url, successCallback, failCallback ) {
    
      $.getJSON( location.protocol + '//www.whateverorigin.org/get?url=' + encodeURIComponent( url ), function( data ) {
        successCallback( data.contents );
      } );
    
    }
    
    var loadContentWithYahooAndWhateverOrigin = function( url, successCallback, failCallback ) {
    
      url = location.protocol + '//www.whateverorigin.org/get?url=' + url;
      var statement = 'select * from json where url="' + url + '"';
      
      $.queryYQL( statement, 'json', undefined, function ( data ) {
        console.log( data.query );
        if( data.query.results ) {
          successCallback( data.query.results.json.contents );
        }
        else {
          failCallback();
        }
        
      } );
    
    }
    
    var successCallback = function successCallback( data ) {
      data = filterData( data );
      setContent( data );
    };
    
    var failCallback = function failCallback() {
      var errormsg = '<p>Error: could not load the page.</p>';
      setContent( errormsg );
    };
    
    //loadContentWithYahoo( url, successCallback, failCallback ); // Problems with loading some websites
    //loadContentWithWhateverOrigin( url, successCallback, failCallback ); // SSL certificate not trusted
    loadContentWithYahooAndWhateverOrigin( url, successCallback, failCallback ); // Fix both problems with a dirty hack
  }
  else {
    setContent( '<p>Error: Can only load http and https contents.</p>' );
	}
}

function loadUrl( url ) {
   
  if( -1 === url.indexOf( "://" ) ) {
    url = location.protocol + '//' + url;
  }
  
  $( '#colorblind-container' ).html( '<iframe id="colorblind"></iframe>' );
  g_Container = $( '#colorblind' );
  updateHeight();
  
  loadFilter();
  
  $( '#url-form .form-control' ).val( url );
  doAjax( url, g_Container );
  //g_Container.attr( 'src', url );
  jump( url );
  
}

function jump( anchor ) {

  var url = location.href;
  history.replaceState( null, null, url );
  location.hash = '#' + anchor;
  
}

$( function main() {

  g_Container = $( '#colorblind' );
  g_CurrentFilter = 'none';
  
  handleIframeHeight();
  handleFormSubmit();
  handleAbnormalityMenu();
  
  loadUrl( 'https://duckduckgo.com' );
  
} );