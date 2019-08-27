function hoverdiv(event){
console.log('in hover, event:' + event.clientX);
var div = document.getElementById('hover-preview');
if(!div) {
    var div = document.createElement('div');
    console.log('div does NOT exist, create');
    div.style.position = 'absolute';
    div.style.width = '100px';
    div.style.height = 'auto';
    div.style.background = 'red';
    div.style.color = 'white';
    div.innerHTML = 'Hello';
    div.id = 'hover-preview';
    div.style.zIndex = 1000;
    div.display = 'block';
document.getElementById('hover-preview-container').appendChild(div);

} else {
    document.getElementById('hover-preview').style.display = 'block';

    console.log('div does exist');
}


var hoverDiv = document.getElementById('hover-preview');

var left  = event.clientX  + "px";
var top  = event.clientY  + "px";


hoverDiv.style.left = left;
hoverDiv.style.top = top;

return false;

}

function hideHoverDiv() {
    console.log('hide');

    document.getElementById('hover-preview').style.display = 'none';
}