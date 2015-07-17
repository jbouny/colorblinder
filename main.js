var g_DomParser = new DOMParser(),
    g_Container,
    g_CurrentLoader,
    g_CurrentFilter,
    g_CurrentUrl;
    
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
    
    pushToHistory();
    
  });

}

function handleAbnormalityMenu() {

  $( '#abnormality-menu li a' ).click( function( event ) {
  
    event.preventDefault();
    
    g_CurrentFilter = $( this ).attr( 'key' );
    loadFilter();
    $( '#abnormality-menu .dropdown-toggle span' ).html( $( this ).html() );
    
    pushToHistory();
    
  } ) ;
  
  $( '#abnormality-menu li a[key=\'' + g_CurrentFilter + '\']' ).click();
  
}

function handleLoaderMenu() {

  $( '#loader-menu li a' ).click( function( event ) {
    event.preventDefault();
    var newLoader = $( this ).attr( 'key' );
    $( '#loader-menu .dropdown-toggle span' ).html( $( this ).html() );
    
    if( newLoader !== g_CurrentLoader ) {
      
      g_CurrentLoader = newLoader;
      
      // Reload the page
      $( '#url-form' ).submit();
      
    }
  } ) ;
  
  $( 'a[key=\'' + g_CurrentLoader + '\']' ).click();

}

function handleHelp() {

  var help = function help() {
  
    messg.set( 'position', 'bottom' );
    messg.set( 'speed', 500 );
    messg.info(
      '<p>Welcome to Colorblinder, a color blindness simulator.</p>' +
      '<p>Please select the color vision deficiency to apply in the top menu.</p>' +
      '<p>The page loading may not work depending of the security policy of the browser. You can choose other ways to load the page in top menu (default: Iframe).</p>' +
      '<p>MIT license, build by <a target="_blank" href="http://www.jeremybouny.fr">Jeremy BOUNY</a>.</p>'
    );
    
  };
  
  help();
  
  $( '#btn-help' ).click( function( event ) {
    event.preventDefault();
    
    if( $( '.messg' ).length === 0 ) {
      help();
    }
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
  
    data = data.replace( new RegExp( '(href|src)="/', 'g' ),  '$1="'+urlParent+'/' );
    
    // Formats:
    // href="...."
    // href = "...."
    // href = '....'
    // src="...."
    // src = "...."
    // src = '....'
    data = data.replace( new RegExp( '(href|src)\s*=\s*(\'|")([^h][^t][^t][^p].*)(\'|")', 'g' ),  '$1="'+urlParent+'/$3"' );
    
    // Formats:
    // url('...')
    // url ('...')
    // url ("...")
    // url ( '...' )
    // url ( "..." )
    data = data.replace( new RegExp( 'url\s*\\(\s*(\'|")([^h][^t][^t][^p].*)(\'|")\s*\\)', 'g' ),  'url(\''+urlParent+'/$2\')"' );
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
    
    switch( g_CurrentLoader )
    {
      case 'yql':
        loadContentWithYahoo( url, successCallback, failCallback ); // Problems with loading some websites
        break;
        
      case 'weo':
        loadContentWithWhateverOrigin( url, successCallback, failCallback ); // SSL certificate not trusted
        break;
        
      default:
      case 'yql+weo':
        loadContentWithYahooAndWhateverOrigin( url, successCallback, failCallback ); // Fix both problems with a dirty hack
        break;
    }
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
  g_CurrentUrl = url;
  updateHeight();
  
  loadFilter();
  
  $( '#url-form .form-control' ).val( url );
  switch( g_CurrentLoader )
  {
    case 'iframe':
      g_Container.attr( 'src', url );
      break;
      
    default:
      doAjax( url, g_Container );
      break
  }
  
}

function jump( anchor ) {

  var url = location.href;
  history.replaceState( null, null, url );
  location.hash = '#' + anchor;
  
}

function pushToHistory() {
  
  jump( g_CurrentLoader + '|' + g_CurrentFilter + '|' + g_CurrentUrl );
  
}

function parseUrlParameters() {
  
  // Default values
  var loader = 'iframe';
  var filter = 'none';
  var url = 'https://duckduckgo.com';
  
  // Parse url to get parameters (if defined)
  var pageUrl = window.location.href, idx = pageUrl.indexOf("#");
  var anchor = idx != -1 ? pageUrl.substring(idx+1) : null;
  
  if( anchor !== null ) {
    
    var tokens = anchor.split( /%7C|\|/ );
    console.log( tokens );
    if( tokens.length === 3 ) {
    
      loader = tokens[0];
      filter = tokens[1];
      url = tokens[2];
      
    }
    
  }
  
  return {
    loader: loader,
    filter: filter,
    url: url
  };
  
}

$( function main() {

  g_Container = $( '#colorblind' );
  
  var data = parseUrlParameters();
  g_CurrentFilter = data.filter;
  g_CurrentLoader = data.loader;
  g_CurrentUrl = data.url;
  
  handleIframeHeight();
  handleFormSubmit();
  handleAbnormalityMenu();
  handleLoaderMenu();
  handleHelp();
  
  loadUrl( g_CurrentUrl );
  
} );