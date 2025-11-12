%include lib/GL.gs

costumes "assets/sakura.png", "assets/key.png";

sounds "assets/TRK_23.mp3";

%define PI 3.1415926
%define TO_DEGREES(radians) (radians * 180 / PI)

%define RANDOM() (random(0.1, 1.1) - 0.1)

%define CURRENT_SECONDS() (days_since_2000() * 86400)

struct Hanabira {
    textureName,
    x,
    y,
    scale,
    rotation,
    width,
    height,
    xk = 0,
    yk = 0,
    rk = 0,
    startTime = 0
};

struct Hanabira_RenderInfo {
    x,
    y,
    rotation
}

list Hanabira hanabiraList = [];
list Hanabira_RenderInfo hanabiraRenderInfoList = [];

proc Hanabira_init {
    delete hanabiraList;
    delete hanabiraRenderInfoList;
}

func Hanabira_add(textureName, x, y, scale, rotation, width, height) {
    add Hanabira{
        textureName: $textureName, 
        x: $x, 
        y: $y, 
        scale: $scale, 
        rotation: $rotation, 
        width: $width,
        height: $height,
        startTime: CURRENT_SECONDS()
    } to hanabiraList;
    
    add Hanabira_RenderInfo{
        x: $x,
        y: $y,
        rotation: $rotation
    } to hanabiraRenderInfoList;
    
    return length(hanabiraList);
}

proc Hanabira_render index {
    GL_bindTexture hanabiraList[$index].textureName, hanabiraList[$index].width, hanabiraList[$index].height;

    local width = 20 * hanabiraList[$index].scale;
    local Hanabira_RenderInfo renderInfo = hanabiraRenderInfoList[$index];
    GL_draw2dTextureToStage renderInfo.x, renderInfo.y, width, width, TO_DEGREES(renderInfo.rotation);
}

func Hanabira_getRandomX() {
    return RANDOM() * GL_SCREEN_WIDTH;
}

func Hanabira_getRandomY() {
    return RANDOM() * GL_SCREEN_HEIGHT;
}

func Hanabira_getRandomScale() {
    return RANDOM() * 0.65 + 0.35;
}

func Hanabira_getRandomRotation() {
    return RANDOM() * 6;
}

func Hanabira_getRandomXk() {
    return - 0.5 + RANDOM();
}

func Hanabira_getRandomYk() {
    return 1.5 + RANDOM() * 0.7;
}

func Hanabira_getRandomRk() {
    return RANDOM() * 0.03;
}

func Hanabira_getCurrentX(x, k, t) {
    return $x + (0.5 * $k - 1.7) * $t;
}

func Hanabira_getCurrentY(y, k, t) {
    return $y + $k * $t;
}

func Hanabira_getCurrentR(r, k, t) {
    return $r + $k * $t;
}

proc Hanabira_update index, t {
    local Hanabira hanabira = hanabiraList[$index];

    local x = hanabiraRenderInfoList[$index].x;
    local y = hanabiraRenderInfoList[$index].y;

    local t = ($t - hanabira.startTime) * 70;
    hanabiraRenderInfoList[$index].x = Hanabira_getCurrentX(hanabira.x, hanabira.xk, t);
    hanabiraRenderInfoList[$index].y = Hanabira_getCurrentY(hanabira.y, hanabira.yk, t);
    hanabiraRenderInfoList[$index].rotation = Hanabira_getCurrentR(hanabira.rotation, hanabira.rk, t);
    if (
        x > GL_SCREEN_WIDTH or
        x < 0 or
        y > GL_SCREEN_HEIGHT or
        y < 0
    ) {
        local rand = RANDOM();
        if (rand > 0.4) {
            hanabiraList[$index].x = Hanabira_getRandomX();
            hanabiraList[$index].y = 0;
            hanabiraRenderInfoList[$index].x = hanabiraList[$index].x;
            hanabiraRenderInfoList[$index].y = hanabiraList[$index].y;
        } else {
            hanabiraList[$index].x = GL_SCREEN_WIDTH;
            hanabiraList[$index].y = Hanabira_getRandomY();
            hanabiraRenderInfoList[$index].x = hanabiraList[$index].x;
            hanabiraRenderInfoList[$index].y = hanabiraList[$index].y;
        }
        hanabiraList[$index].scale = Hanabira_getRandomScale();
        hanabiraList[$index].rotation = Hanabira_getRandomRotation();
        hanabiraRenderInfoList[$index].rotation = hanabiraList[$index].rotation;
        hanabiraList[$index].startTime = $t;
    }
}

proc HanabiraList_update t {
    local i = 1;
    repeat length(hanabiraList) {
        Hanabira_update i, $t;
        i += 1;
    }
}

proc HanabiraList_render {
    local i = 1;
    repeat length(hanabiraRenderInfoList) {
        Hanabira_render i;
        i += 1;
    }
}

proc HanabiraList_init {
    delete hanabiraList;
    repeat 15 {
        local randomX = Hanabira_getRandomX();
        local randomY = Hanabira_getRandomY();
        local randomScale = Hanabira_getRandomScale();
        local randomRotation = Hanabira_getRandomRotation();
        local index = Hanabira_add ("sakura", randomX, randomY, randomScale, randomRotation, 328, 304);
        local xk = Hanabira_getRandomXk();
        local yk = Hanabira_getRandomYk();
        local rk = Hanabira_getRandomRk();
        hanabiraList[index].xk = xk;
        hanabiraList[index].yk = yk;
        hanabiraList[index].rk = rk;
    }
}

proc drawKeyLogo {
    GL_bindTexture "key", 243, 192;
    GL_draw2dTextureToStage GL_SCREEN_WIDTH / 2, GL_SCREEN_HEIGHT / 2, 100, 100, 90;
}

var START_TIME;

on "startFalling" {
    HanabiraList_init;
    START_TIME = CURRENT_SECONDS();
    forever {
        GL_clearStage;
        HanabiraList_update CURRENT_SECONDS();
        drawKeyLogo;
        HanabiraList_render;
    }
}

on "startSound" {
    forever {
        play_sound_until_done "TRK_23";
    }
}

onflag {
    Hanabira_init;
    broadcast "startFalling";
    broadcast "startSound";
}