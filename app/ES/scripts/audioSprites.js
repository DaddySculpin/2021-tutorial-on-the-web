function AudioSprites(audioElement, sprites) {

    if (!audioElement || audioElement.tagName !== 'AUDIO') {
        throw new Error('AudioSprites - invalid parameter: audioElement');
    }
    if (!sprites) {
        throw new Error('AudioSprites - invalid parameter: sprites');
    }

    var self = this;

	//#region Member Variables

	// HTML5 Audio Element
    this._audioElement = audioElement;

	// Audio Sprites Definition - { id, length }
    this._sprites = sprites;

    // Indicates whether
    this._initialized = false;
    this._currentSprite = null;

    //#endregion

	//#region Member Functions - HTML5 Audio Event Listeners

	this._audioElement.addEventListener('timeupdate', function(e) {
		self._ontimeupdate(e);
	});

	this._audioElement.addEventListener('loadeddata', function(e) {
		self._onloadeddata(e);
	});

	this._ontimeupdate = function(e) {
		if (this._currentSprite && this._audioElement.currentTime > this._currentSprite.end) {
			console.log('AudioSprites', 'ontimeupdate', 'Stopping at time ', this._audioElement.currentTime);
			this.stop();
		}
	};

	this._onloadeddata = function(e) {
	};

	//#endregion

    console.info('AudioSprites', 'Instantiated sprite', this);

    //#region Member Functions - Private

	// Calculate start and end time for sprites
    this._prepareSprites = function () {
        console.log('AudioSprites', 'Prepare sprites', this);
        var offset = 0;
        for (var i = 0, l = this._sprites ? this._sprites.length : -1; i < l; i++) {
            this._sprites[i].start = offset;
            this._sprites[i].end = offset + this._sprites[i].length;
			offset += this._sprites[i].length;
        }
    };

	// Get audio element
    this._getAudioElement = function () {
        return this._audioElement;
    };

    // Get sprite by ID
    this._getSprite = function (id) {
        console.log('AudioSprites', 'Get Sprite', id);
        for (var i = 0, l = this._sprites.length; i < l; i++) {
            if (this._sprites[i].id === id) return this._sprites[i];
        }
        return null;
    };

    //#endregion

    //#region Member Functions - Public

	// This function needs to be called via user interaction in order to pre-load audio
    this.initialize = function () {
        console.log('AudioSprites', 'initialize');
        this._prepareSprites();
		try {
	        var audioElement = this._getAudioElement();
			audioElement.play();
			setTimeout(function() {
			audioElement.pause();
			}, 100);
		} catch (e) {
			console.error('AudioSprites', 'initialize', 'Failed to load audio element', e);
		}
        this._initialized = true;
    };

	// Play audio segment, per sprite definition, by ID
    this.play_sprite = function (id) {
		if (!this._initialized) throw new Error('Audio sprite has not been initialized');

        this.stop();
        var sprite = this._getSprite(id);
        var audioElement = this._getAudioElement();
        console.log('AudioSprites', 'Buffered length', audioElement.buffered.length);
        for (var i = 0; i < audioElement.buffered.length; i++) {
			console.log('AudioSprites', 'Buffered Range', i, 'start', audioElement.buffered.start(i), 'end', audioElement.buffered.end(i));
		}
        if (sprite !== null) {
            console.info('AudioSprites', 'play_sprite', 'Play sprite', sprite.id, 'start', sprite.start, 'end', sprite.end, 'length', sprite.length);
            this._currentSprite = sprite;
            try {
                audioElement.pause();
                audioElement.currentTime = sprite.start;  // current time in seconds
                audioElement.play();
            } catch (e) {
                console.error('AudioSprites', 'play_sprite', 'Failed to play sprite', e);
            }
        } else {
            console.error('AudioSprites', 'play_sprite', 'Unable to locate sprite', id);
        }
    };

	// Stop audio
    this.stop = function () {
        console.log('AudioSprites', 'stop');

        var audioElement = this._getAudioElement();
        if (audioElement) {
            audioElement.pause();
        }
        this._currentSprite = null;
    };

    //#endregion

}

