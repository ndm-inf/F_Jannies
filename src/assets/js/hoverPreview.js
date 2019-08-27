function hoverdiv(event, divToPreview){

    var preview = document.getElementById('hover-preview');
    var div = document.getElementById(divToPreview.trim());
    var clone = div.cloneNode(true);
    clone.id = 'hover-preview';
    clone.style.position = 'absolute';
    clone.style.borderColor='#333333';
    clone.style.borderStyle='solid';
    clone.style.borderWidth = '2px';
    clone.style.backgroundColor = '#111111';
    
    if(!preview) {
      
        document.getElementById('hover-preview-container').appendChild(clone);
    } else {
        preview.remove();
        document.getElementById('hover-preview-container').appendChild(clone);
        document.getElementById('hover-preview-container').style.display = 'block';
    }

    if(event.clientX > 800) {
        document.getElementById('hover-preview-container').style.top = event.clientY + window.scrollY + 20 + "px";
        document.getElementById('hover-preview-container').style.left = event.clientX - 800 + "px";

    }
    else if(event.clientX > 200) {
        document.getElementById('hover-preview-container').style.left = event.clientX - 230 + "px";
        document.getElementById('hover-preview-container').style.top = event.clientY + window.scrollY - 60 + "px";

    } else {
        document.getElementById('hover-preview-container').style.left = event.clientX + 30 + "px";
        document.getElementById('hover-preview-container').style.top = event.clientY + window.scrollY - 60 + "px";

    }

    return false;
}

function hideHoverDiv() {
    console.log('hide');

    document.getElementById('hover-preview-container').style.display = 'none';
}
