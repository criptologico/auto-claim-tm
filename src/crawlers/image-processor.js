class ImageProcessor {
    constructor(img) {
        this._img = img;
    }

    isImageComplete() {
        return this._img && this._img.complete;
    }

    createDrawer(width, height) {
        let canvas = document.createElement('canvas');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        let ctx = canvas.getContext('2d');
        return {
            canvas: canvas,
            ctx: ctx
        };
    }

    getDrawer() {
        return this._drawer;
    }

    toCanvas() {
        this._drawer = this.createDrawer(this._img.width, this._img.height);
        this._drawer.ctx.drawImage(this._img, 0, 0);
    }

    foreach(filter) {
        let imgData = this._drawer.ctx.getImageData(0, 0, this._drawer.canvas.width, this._drawer.canvas.height);
        for (var x = 0; x < imgData.width; x++) {
            for (var y = 0; y < imgData.height; y++) {
                var i = x * 4 + y * 4 * imgData.width;
                var pixel = { r: imgData.data[i + 0], g: imgData.data[i + 1], b: imgData.data[i + 2] };

                pixel = filter(pixel);

                imgData.data[i + 0] = pixel.r;
                imgData.data[i + 1] = pixel.g;
                imgData.data[i + 2] = pixel.b;
                imgData.data[i + 3] = 255;
            }
        }
        this._drawer.ctx.putImageData(imgData, 0, 0);
    }

    binarize (threshold) {
        var image = this._drawer.canvas.getContext('2d').getImageData(0, 0, this._drawer.canvas.width, this._drawer.canvas.height);
        for (var x = 0; x < image.width; x++) {
            for (var y = 0; y < image.height; y++) {
                var i = x * 4 + y * 4 * image.width;
                var brightness = 0.34 * image.data[i] + 0.5 * image.data[i + 1] + 0.16 * image.data[i + 2];
                image.data[i] = brightness >= threshold ? 255 : 0;
                image.data[i + 1] = brightness >= threshold ? 255 : 0;
                image.data[i + 2] = brightness >= threshold ? 255 : 0;
                image.data[i + 3] = 255;
            }
        }
        this._drawer.canvas.getContext('2d').putImageData(image, 0, 0);
    }

    invert(filter) {
        this.foreach(function (p) {
            p.r = 255 - p.r;
            p.g = 255 - p.g;
            p.b = 255 - p.b;
            return p;
        });
    }

    imgDataToBool(imgData) {
        let character = [];
        const data = imgData.data;
        for (let i = 0; i < imgData.data.length; i += 4) {
            let val = data[i] + data[i+1] + data[i+2];
            character.push(val == 0 ? true : false);
        }
        return character;
    }
}
