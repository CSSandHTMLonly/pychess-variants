import { h, VNode } from 'snabbdom';

import { Howl } from 'howler';

import { _ } from './i18n';
import { Variant } from './variants';
import { StringSettings, NumberSettings } from './settings';
import { radioList, slider } from './view';


class Sounds {

    private static readonly trackNames = {
        GenericNotify: 'GenericNotify',
        SocialNotify: 'SocialNotify',
        Move: 'Move',
        Capture: 'Capture',
        Check: 'Check',
        Draw: 'Draw',
        Victory: 'Victory',
        Defeat: 'Defeat',
        ShogiMove: 'ShogiMove',
        ShogiCapture: 'ShogiCapture',
        Chat: 'chat',
        Setup: 'dinding',
        LowTime: 'LowTime',
        Tick: 'Tick',
        Explosion: 'Explosion',
        Berserk: 'Berserk',
    };

    private static readonly bugTrackNames = {
        p: 'pawn',
        n: 'knight',
        b: 'bishop',
        r: 'rook',
        q: 'queen',
        h: 'horse',
        e: 'elephant',
//        c: 'chariot',
        c: 'cannon',
        a: 'advisor',
        nop: 'no-pawn',
        non: 'no-knight',
        nob: 'no-bishop',
        nor: 'no-rook',
        noq: 'no-queen',
        noh: 'no-horse',
        noe: 'no-elephant',
//        noc: 'no-chariot',
        noc: 'no-cannon',
        noa: 'no-advisor',
        sit: 'sit',
        go: 'go',
        trade: 'trade',
        notrade: 'dont-trade',
        mate: 'checkmate',
        ok: 'ok',
        no: 'no',
        mb: 'my-bad',
        nvm: 'nevermind',
        nice: 'nice',
    };

    tracks: { [key: string]: Howl };

    constructor() {
        this.tracks = {};
    }

    updateVolume() {
        const volume = volumeSettings.value;
        Object.keys(this.tracks).forEach(key => {
            this.tracks[key].volume(volume);
        });
    }

    buildBugChatSounds(assetURL: string) {
        Object.keys(Sounds.bugTrackNames).forEach( (key: keyof typeof Sounds.bugTrackNames) => {
            this.tracks[key] = this.buildSound(assetURL, 'bugchat', Sounds.bugTrackNames[key]);
        });
    }

    updateSoundTheme(assetURL: string) {
        const soundTheme = soundThemeSettings.value;
        Object.keys(Sounds.trackNames).forEach( (key: keyof typeof Sounds.trackNames) => {
            this.tracks[key] = this.buildSound(assetURL, soundTheme, Sounds.trackNames[key]);
        });
    }

    private buildSound(assetURL: string, soundTheme: string, trackName: string) {
        const soundTrack = (soundTheme === 'silent') ? 'Silence' : trackName;
        const sound = new Howl({
            src: [
                assetURL + '/sound/' + soundTheme + '/' + soundTrack + '.ogg',
                assetURL + '/sound/' + soundTheme + '/' + soundTrack + '.mp3'
            ],
            onplayerror: function() {
                sound.once('unlock', function() {
                sound.play();
                });
            },
            volume: volumeSettings.value,
        });
        return sound;
    }

    private audio() {
        return soundThemeSettings.value !== 'silent';
    }

    genericNotify() { if (this.audio()) this.tracks.GenericNotify.play(); }
    socialNotify()  { if (this.audio()) this.tracks.SocialNotify.play(); }
    move()          { if (this.audio()) this.tracks.Move.play(); }
    capture()       { if (this.audio()) this.tracks.Capture.play(); }
    check()         { if (this.audio()) this.tracks.Check.play(); }
    draw()          { if (this.audio()) this.tracks.Draw.play(); }
    victory()       { if (this.audio()) this.tracks.Victory.play(); }
    defeat()        { if (this.audio()) this.tracks.Defeat.play(); }
    shogimove()     { if (this.audio()) this.tracks.ShogiMove.play(); }
    shogicapture()  { if (this.audio()) this.tracks.ShogiCapture.play(); }
    chat()          { if (this.audio()) this.tracks.Chat.play(); }
    setup()         { if (this.audio()) this.tracks.Setup.play(); }
    lowTime()       { if (this.audio()) this.tracks.LowTime.play(); }
    tick()          { if (this.audio()) this.tracks.Tick.play(); }
    explosion()     { if (this.audio()) this.tracks.Explosion.play(); }
    berserk()       { if (this.audio()) this.tracks.Berserk.play(); }

    bugchat(msg:string) { if (this.audio()) this.tracks[msg].play(); }

    private moveSoundSet: {[k:string]: { move: ()=> void; capture: ()=>void;}} = {
        regular: { move: () => this.move(), capture: () => this.capture() },
        shogi: { move: () => this.shogimove(), capture: () => this.shogicapture() },
        atomic: { move: () => this.move(), capture: () => this.explosion() },
    };

    bugChatSound(msg: string) { this.bugchat(msg) }

    moveSound(variant: Variant, capture: boolean) {
        const soundSet = variant.ui.pieceSound in this.moveSoundSet? this.moveSoundSet[variant.ui.pieceSound] : this.moveSoundSet.regular;
        if (capture)
            soundSet.capture();
        else
            soundSet.move();
    }

    gameEndSound(result: string, color: string) {
        switch (result) {
            case "1/2-1/2":
                this.draw();
                break;
            case "1-0":
                if (color === "white")
                    this.victory();
                else
                    this.defeat();
                break;
            case "0-1":
                if (color === "black")
                    this.victory();
                else
                    this.defeat();
                break;
        }
    }

    gameEndSoundBughouse(result: string, team: '1' | '2') {
        switch (result) {
            case "1/2-1/2":
                this.draw();
                break;
            case "1-0":
                if (team === "1")
                    this.victory();
                else
                    this.defeat();
                break;
            case "0-1":
                if (team === "2")
                    this.victory();
                else
                    this.defeat();
                break;
        }
    }
}

class VolumeSettings extends NumberSettings {

    constructor() {
        super('volume', 1);
    }

    update(): void {
        sound.updateVolume();
    }

    view(): VNode {
        return h('div', slider(this, 'sound-volume', 0, 1, 0.01, _('Volume')));
    }
}

const soundThemes = {
    silent: "Silent",
    standard: "Standard",
    piano: "Piano",
    nes: "NES",
    sfx: "SFX",
    futuristic: "Futuristic",
    lisp: "Lisp",
    robot: "Robot",
};

class SoundThemeSettings extends StringSettings {
    assetURL: string;

    constructor() {
        super('soundtheme', 'standard');
    }

    update(): void {
        sound.updateSoundTheme(this.assetURL);
    }

    buildBugChatSounds(): void {
        sound.buildBugChatSounds(this.assetURL);
    }

    view(): VNode {
        return h('div#soundtheme.radio-list', radioList(this, 'soundtheme', soundThemes, (_, key) => this.value = key));
    }
}

export const sound = new(Sounds);
export const volumeSettings = new VolumeSettings();
export const soundThemeSettings = new SoundThemeSettings();
