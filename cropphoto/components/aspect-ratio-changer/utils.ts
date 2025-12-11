export const getImage = (src: string): Promise<HTMLImageElement> => {
    const img = new Image();
    // cors
    if (!src.startsWith('data')) {
        img.crossOrigin = 'Anonymous';
    }
    return new Promise(function (resolve, reject) {
        img.onload = function () {
            resolve(img);
        };
        const errorHandler = function () {
            return reject(
                new Error('An error occurred attempting to load image')
            );
        };
        img.onerror = errorHandler;
        img.onabort = errorHandler;
        img.src = src;
    });
};

export const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
}

export const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation);
    return {
        width:
            Math.abs(Math.cos(rotRad) * width) +
            Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) +
            Math.abs(Math.cos(rotRad) * height),
    };
}

export const url2Blob = async (url: string): Promise<Blob> => {
    return await (await fetch(url)).blob();
};

export const copyAsBlob = (value: Blob) =>
    navigator.clipboard.write([
        new ClipboardItem({
            [value.type]: value,
        }),
    ]);

export const toDownloadFile = (url: string, name: string) => {
    const tmpLink = document.createElement('a');
    tmpLink.href = url;
    tmpLink.download = name;
    tmpLink.style.cssText = 'position: absolute; z-index: -111; visibility: none;';
    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
};

export const isAppleDevice = () => {
    const PLATFORM = typeof navigator === 'object' ? navigator.platform : '';
    return /Mac|iPod|iPhone|iPad/.test(PLATFORM);
};

export const modKey = () => (isAppleDevice() ? '⌘' : 'Ctrl');

export const supportImg = [
    'image/jpeg',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/webp',
];

