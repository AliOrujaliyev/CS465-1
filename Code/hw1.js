/* 
CS 465 - Assigment # 1
Ali Orujaliyev
21503357
Section 01
08/03/2018
*/

var canvas;
var gl;
var points = [];

// number of the subdivision
var NumTimesToSubdivide = 0;
// variables for dynamic canvas
var x1;
var x2;
var y1;
var y2;
var x;
var y;

// color index for background
var cIndex = 0;
// check if it is lined or squared
var buttonPressed = false;

// colors for background in hex
var colors = [ "#000000", "#ff0000", "#ffff00", "#008000", "#0000ff", "#ff00ff", "#00ffff"];

// initializing canvas
function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }      


// vertices of the original square
var vertices = [
        vec2( -1, -1 ),
        vec2( -1, 1 ),
        vec2( 1, -1 ),
	    vec2( 1, 1 )    
];

//var strings = [ x1, x2, y1, y2, cIndex, NumTimesToSubdivide, buttonPressed];
	

// calls the function which creates Searpinski carpet  
divideSquare( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

// adding the listeners for the dynamic canvas

canvas.addEventListener("mousedown", getTwoPoints);
canvas.addEventListener("mouseup", getLastTwoPoints);


    // function to load files. taken from the web. link: https://www.html5rocks.com/en/tutorials/file/dndfiles/

		document.getElementById("files").addEventListener('change', function(){
    	var fr = new FileReader();
    	fr.onload = function(){
    		document.getElementById("fileContents").textContent = this.result;
    	}
    	var text = (this.files[0]);

    	var temp = ""
		for (var j = 0; j < text.length ; j++)
    	temp += text[j] + "<br>";

    	console.log(temp);
    	});
	


	// ggetting the first two points of the viewport
    function getTwoPoints(event )
    {
      x1 = event.clientX;
      y1 = event.clientY;
    }
    // getting the second two points and creating our viewport
    function getLastTwoPoints(event )
    {
      x2 = event.clientX;
      y2 = event.clientY;

      // logic is mine
      gl.viewport( x1 < x2 ? x1 : x2, canvas.height - (y1 > y2 ? y1 : y2), Math.abs(x2-x1), Math.abs(y2-y1));
    }

    // clear color for canvas
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );    

    // initializing shaders
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // taking the instance of the color picker menu
    var m = document.getElementById("mymenu");

    // setting our color index to the color that was pressed on the screen
    // taken idea from the cad1 code, provided in the course web site
    m.addEventListener("click", function(){
    cIndex = m.selectedIndex;
    document.body.style.backgroundColor = colors[m.selectedIndex];
    });


    // Button listener for Lined carpet
    var lineButton = document.getElementById("lined");

    // when "Line" buttonn clicked then change our variable to true
    lineButton.addEventListener("click", function(){
    	buttonPressed = true;

    });

    // Button listener for Filled carpet
    var filledButton = document.getElementById("filled");

    // when "Filled" button clicked then change back our variable to false
    filledButton.addEventListener("click", function(){
    	buttonPressed = false;
    });


	// Load the data into the GPU
  // loading vertices
  	var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
   
    // loading the vertex position
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // change the number of subdivides when slider is changed
    document.getElementById("slider").onchange = function() {
        NumTimesToSubdivide = event.srcElement.value;
    };

    render();
};

// pushed the 2 triangles to the array
function square( a, b, c, d )
{
    points.push( a, b, c );
    points.push( b, c, d );
}
// push the 4 buttons to the array ( 2 lines )
function lineSquare(a,b,c,d)
{
	points.push(a,b,c,d);
}


function divideSquare( a, b, c, d, count )
{

    
    // find the 12 points that will be needed for the subdivision
    
      var bd1 = mix( b, d, 0.33 );
	    var bd2 = mix( d, b, 0.33 );
      var ba1 = mix( b, a, 0.33 );
	    var bc1 = mix( b, c, 0.33 );
      var ad2 = mix( d, a, 0.33 );
      var cd2 = mix( d, c, 0.33 );

      var ba2 = mix( a, b, 0.33 );
      var ad1 = mix( a, d, 0.33 );
      var bc2 = mix( c, b, 0.33 );
      var cd1 = mix( c, d, 0.33 );

      var ac1 = mix( a, c, 0.33 );
      var ac2 = mix( c, a, 0.33 );


      // if it is lined and count is equal 1 because when it is in lined mode, we push points one times more
      // than when it is in the filled mode
    	if ( buttonPressed && count == 1 )
    	{
    		lineSquare(ad1,bc1, ad2, bc2);
    		lineSquare(bc1, ad2, ad1, bc2);
    	}
      // if it is filled mode then push 4 points.
    	else if ( count == 0 )
    	{
        	square( a, b, c, d);
    	}
      // if we have more iterations to do
    	else {
        // if it is lined then push the first points before recursion
    		if ( buttonPressed )
        	{
        		lineSquare(ad1,bc1, ad2, bc2);
        		lineSquare(bc1, ad2, ad1, bc2);
        	}
          // decrement the counter
          --count;

            // first row of squares
  	        divideSquare( ba1, b, bc1, bd1, count );

  	        divideSquare( bc1, bd1, ad2, bd2, count );

  		      divideSquare( ad2, bd2, cd2, d, count );

  	        // second row of squares, we have only two recursion because we do not draw middle square
  	        divideSquare( ba2, ba1, ad1, bc1, count );

  	        divideSquare( bc2, ad2, cd1, cd2, count );

  	        // third row of squares
  	        divideSquare( a, ba2, ac1, ad1, count );

  	        divideSquare( ac1, ad1, ac2, bc2, count );

  	        divideSquare( ac2, bc2, c, cd1, count );
      }
}

// load initialization function on load
window.onload = init;

function render() {
   gl.clear( gl.COLOR_BUFFER_BIT );
   // draw lines when it is in lined mode
   if ( buttonPressed ) 
   {
   	gl.drawArrays(gl.LINES, 0, points.length);
   }
   // draw triangles if it is in the filled mode
   else
   {
   	gl.drawArrays( gl.TRIANGLES, 0, points.length );
   }
   // clear content of the 
   points = [];
   // animate the scene on each mouse click
   window.onclick = requestAnimFrame(init);
}