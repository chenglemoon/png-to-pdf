import { makeAutoObservable } from 'mobx';
import { getImage, getRadianAngle, rotateSize, url2Blob, copyAsBlob, toDownloadFile } from './utils';

class ScreenshotState {
    isGrid = false;
    imageSrc: string | null = null;
    isCrop = false;
    crop = { x: 0, y: 0 };
    rotation = 0;
    zoom = 1;
    aspect = 4 / 3;
    croppedAreaPixels: any = null;
    croppedImage: any = null;
    
    constructor() {
        makeAutoObservable(this);
    }

    toggleGrid() {
        this.isGrid = !this.isGrid;
    }

    reset() {
        this.crop = { x: 0, y: 0 };
        this.rotation = 0;
        this.zoom = 1;
        this.croppedAreaPixels = null;
        this.croppedImage = null;
    }

    setIsCrop(value: boolean) {
        this.isCrop = value;
        if (!value) {
            this.reset();
        }
    }

    setImageSrc(value: string | null) {
        this.imageSrc = value;
    }

    setCrop(value: { x: number; y: number }) {
        this.crop = value;
    }

    setRotation(value: number) {
        this.rotation = value;
    }

    setZoom(value: number) {
        this.zoom = value;
    }

    zoomIn() {
        this.zoom += 0.1;
    }

    zoomOut() {
        this.zoom -= 0.1;
    }

    setAspect(value: number) {
        this.aspect = value;
    }

    rotateLeft() {
        let val = this.rotation + 90;
        if (val > 360) {
            val = val - 360;
        }
        this.rotation = val;
    }

    onCropCompleteEvent(croppedArea: any, croppedAreaPixels: any) {
        this.croppedAreaPixels = croppedAreaPixels;
    }

    async getCroppedImg(): Promise<string | null> {
        const pixelCrop = this.croppedAreaPixels;
        if (!pixelCrop || !this.imageSrc) return null;
        
        const flip = { horizontal: false, vertical: false };
        const image = await getImage(this.imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        const rotRad = getRadianAngle(this.rotation);
        const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
            image.width,
            image.height,
            this.rotation
        );

        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;

        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate(rotRad);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        ctx.translate(-image.width / 2, -image.height / 2);
        ctx.drawImage(image, 0, 0);
        const croppedCanvas = document.createElement('canvas');

        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
            return null;
        }

        croppedCanvas.width = pixelCrop.width;
        croppedCanvas.height = pixelCrop.height;

        croppedCtx.drawImage(
            canvas,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        // As Base64 string
        return croppedCanvas.toDataURL('image/png');
    }

    downloadFile() {
        if (!this.imageSrc) return;
        toDownloadFile(this.imageSrc, 'shoteasy-screenshot.png');
    }

    async copyFile() {
        if (!this.imageSrc) return;
        const file = await url2Blob(this.imageSrc);
        await copyAsBlob(file);
    }
}

const screenshotState = new ScreenshotState();

export default screenshotState;


