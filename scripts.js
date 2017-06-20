var satData = [
  { rad:  1.5, speed: 7, phi0: 90, cx: 115, cy: 0, move: true },
  { rad: 15, speed: 14, phi0: 90, cx: 150, cy: 0, move: true },
  { rad:  3.5, speed: 2, phi0: 90, cx: 183, cy: 0, move: true },
  { rad: 3.5, speed: 4, phi0: 90, cx: 237, cy: 0, move: true },
  { rad:  6.8, speed: 5, phi0: 90, cx: 385, cy: 0, move: true },
  { rad: 5.3, speed: 6, phi0: 90, cx: 294, cy: 0, move: true },
  { rad: 3.8, speed: 15, phi0: 90, cx: 400, cy: 0, move: true },
  { rad: 4.2, speed: 22, phi0: 90, cx: 125, cy: 0, move: true },
  { rad: 20, speed: 40, phi0: 90, cx: 125, cy: 0, move: false }
];

var newObject = null;
var running = true;

function mainFunk() {

  var svg = d3.select("svg");

  //for each item in satData create a new satelite circle element
  var satelite = svg.selectAll(".start")
      .data(satData, function(d, i) { return (i); } )
      .attr("class", "satelite");

  satelite.enter().append("circle")
      .attr("class", "satelite");

  var allSatelites = svg.selectAll(".satelite")
  allSatelites.attr("cx", function(d) { return d.cx; });
  allSatelites.attr("cy", function(d) { return d.cy; });
  allSatelites.attr("r", function(d) { return d.rad; });


  var masterRad = 0;

  function updateAnim() {

    if (newObject != null) {

      var satelite = svg.selectAll(".start")
          .data(satData, function(d, i) { return (i); } )
          .attr("class", "satelite");

      satelite.enter().append("circle")
          .attr("class", "satelite");

      var allSatelites = svg.selectAll(".satelite")
      allSatelites.attr("cx", function(d) { return d.cx; });
      allSatelites.attr("cy", function(d) { return d.cy; });
      allSatelites.attr("r", function(d) { return d.rad; });

      newObject = null;
    }

    svg.selectAll(".satelite").attr("transform", function(d) {
      if (d.move === true) {
        return "translate(500,500), rotate(" + (masterRad * d.speed/100) + ")";
      } else {
        return "translate(500,500)";
      }

    });
    if (masterRad === 10000) {
      masterRad = 0;
    }

    if (running === true) {
      masterRad += 1;
    }

  }

  var runningFunction = updateAnim
  d3.timer(runningFunction);

  allSatelites.on("mouseover", displayData);
  allSatelites.on("mouseout", hideData);

  function displayData(){
    d3.select(this).style("stroke", "black").style("stroke-width", 5);
    // for (var i = 0; i<satData.length; i++)	{
  	// 	console.log(satData[i]['move']=false);
  	// };
    running = false;

  };

  function hideData(){
    d3.select(this).style("stroke", "black").style("stroke-width", 1);
    running = true;
  };

}



$(document).ready(function(){

  $('#myBtn').click(function(){
    mainFunk();
  });

  $('#submit-form').submit(function(event){
    event.preventDefault();
    var radInput = parseFloat($("input#rad").val());
    var speedInput = parseFloat($("input#speed").val());
    var phiInput = parseFloat($("input#phi").val());
    var cxInput = parseFloat($("input#cx").val());
    var cyInput = parseFloat($("input#cy").val());
    newObject = { rad:  radInput, speed: speedInput, phi0: phiInput, cx: cxInput, cy: cyInput, move: true };
    satData.push(newObject);
    // mainFunk();
  });

});
