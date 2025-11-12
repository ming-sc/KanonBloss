%if not GL
%define GL

costumes "blank.svg";

%define GL_BLANK_TEXTURE "blank"

%if not GL_SCREEN_WIDTH
%define GL_SCREEN_WIDTH 480
%endif

%if not GL_SCREEN_HEIGHT
%define GL_SCREEN_HEIGHT 360
%endif

%define GL_POS_TRANSFORM_X(x) x - GL_SCREEN_WIDTH / 2
%define GL_POS_TRANSFORM_Y(y) GL_SCREEN_HEIGHT / 2 - y

var GL_BIND_TEXTURE = GL_BLANK_TEXTURE;
var GL_BIND_TEXTURE_WIDTH = 0;
var GL_BIND_TEXTURE_HEIGHT = 0;

proc GL_bindTexture textureName, width, height {
    GL_BIND_TEXTURE = $textureName;
    GL_BIND_TEXTURE_WIDTH = $width;
    GL_BIND_TEXTURE_HEIGHT = $height;
}

proc GL_draw2dTextureToStage x, y, width, height, rotation {
    local k = $width / GL_BIND_TEXTURE_WIDTH;
    local scale = k * 100;

    switch_costume GL_BIND_TEXTURE;
    set_size scale;
    goto GL_POS_TRANSFORM_X($x), GL_POS_TRANSFORM_Y($y);
    point_in_direction $rotation;
    stamp;
}

proc GL_clearStage {
    erase_all;
}

%endif