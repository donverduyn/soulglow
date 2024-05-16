import quantize from './quantize';

function createPixelArray(
  imgData: Uint8ClampedArray,
  pixelCount: number,
  quality: number
) {
  const pixels = imgData;
  const pixelArray = [];

  for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
    offset = i * 4;
    r = pixels[offset + 0];
    g = pixels[offset + 1];
    b = pixels[offset + 2];
    a = pixels[offset + 3];

    // If pixel is mostly opaque and not white
    if (typeof a === 'undefined' || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b]);
      }
    }
  }
  return pixelArray;
}

function validateOptions(options: {
  colorCount: number | undefined;
  quality: number | undefined;
}) {
  let { colorCount, quality } = options;

  if (typeof colorCount === 'undefined' || !Number.isInteger(colorCount)) {
    colorCount = 10;
  } else if (colorCount === 1) {
    throw new Error(
      'colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()'
    );
  } else {
    colorCount = Math.max(colorCount, 2);
    colorCount = Math.min(colorCount, 20);
  }

  if (
    typeof quality === 'undefined' ||
    !Number.isInteger(quality) ||
    quality < 1
  ) {
    quality = 10;
  }

  return {
    colorCount,
    quality,
  };
}

class CanvasImage {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(image: HTMLImageElement) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.width = this.canvas.width = image.naturalWidth;
    this.height = this.canvas.height = image.naturalHeight;
    this.context.drawImage(image, 0, 0, this.width, this.height);
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.width, this.height);
  }
}

class ColorThief {
  getColor(sourceImage: HTMLImageElement, quality: number) {
    const palette = this.getPalette(sourceImage, 5, quality);
    const dominantColor = palette[0];
    return dominantColor;
  }

  getPalette(
    sourceImage: HTMLImageElement,
    colorCount?: number,
    quality?: number
  ) {
    const options = validateOptions({
      colorCount,
      quality,
    });

    // Create custom CanvasImage object
    const image = new CanvasImage(sourceImage);
    const imageData = image.getImageData();
    const pixelCount = image.width * image.height;

    const pixelArray = createPixelArray(
      imageData.data,
      pixelCount,
      options.quality
    );

    // Send array to quantize function which clusters values
    // using median cut algorithm
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cmap = quantize(pixelArray, options.colorCount);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const palette = cmap ? cmap.palette() : null;

    return palette as number[][];
  }

  getColorFromUrl(
    imageUrl: string,
    callback: (color: number[], imageUrl: string) => void,
    quality: number
  ) {
    const sourceImage = document.createElement('img');

    sourceImage.addEventListener('load', () => {
      const palette = this.getPalette(sourceImage, 5, quality);
      const dominantColor = palette[0];
      callback(dominantColor, imageUrl);
    });
    sourceImage.src = imageUrl;
  }

  getImageData(imageUrl: string, callback: (imageData: string) => void) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      if (this.status == 200) {
        const uInt8Array = new Uint8Array(this.response as Iterable<number>);
        const i = uInt8Array.length;
        const binaryString = new Array(i);
        for (let i = 0; i < uInt8Array.length; i++) {
          binaryString[i] = String.fromCharCode(uInt8Array[i]);
        }
        const data = binaryString.join('');
        const base64 = window.btoa(data);
        callback('data:image/png;base64,' + base64);
      }
    };
    xhr.send();
  }

  getColorAsync(
    imageUrl: string,
    callback: (color: number[], image: HTMLImageElement) => void,
    quality: number
  ) {
    this.getImageData(imageUrl, (imageData) => {
      const sourceImage = document.createElement('img');
      sourceImage.addEventListener('load', () => {
        const palette = this.getPalette(sourceImage, 5, quality);
        const dominantColor = palette[0];
        callback(dominantColor, sourceImage);
      });
      sourceImage.src = imageData;
    });
  }
}

export default ColorThief;
