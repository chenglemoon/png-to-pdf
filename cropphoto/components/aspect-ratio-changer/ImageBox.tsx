import React from 'react';
import { observer } from 'mobx-react-lite';
import Cropper from 'react-easy-crop';
import { cn } from '@/lib/utils';
import ToolBar from './ToolBar';
import screenshotState from './screenshotState';

const ImageBox = observer(() => {
    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        screenshotState.onCropCompleteEvent(croppedArea, croppedAreaPixels);
    }
    return (
        <div className={cn("rounded-md shadow-lg border-t overflow-hidden border-t-gray-600 antialiased", screenshotState.isGrid ? 'tr' : 'polka')}>
            <ToolBar />
            <div className="relative h-[420px]">
                {!screenshotState.isCrop ? <img src={screenshotState.imageSrc || ''} className="w-full h-full object-scale-down" alt="Preview" /> :
                    <Cropper
                        image={screenshotState.imageSrc || ''}
                        crop={screenshotState.crop}
                        rotation={screenshotState.rotation}
                        zoom={screenshotState.zoom}
                        aspect={screenshotState.aspect}
                        onCropChange={(location) => screenshotState.setCrop(location)}
                        onRotationChange={(rotation) => screenshotState.setRotation(rotation)}
                        onCropComplete={onCropComplete}
                        onZoomChange={(zoom) => screenshotState.setZoom(zoom)}
                        classes={{
                            mediaClassName: 'transition-transform opacity-100',
                            cropAreaClassName: 'transition-all opacity-100'
                        }}
                    />
                }
            </div>
        </div>
    )
});

export default ImageBox;


