type AttachmentTemplate<T extends string> = {
	[key in T | 'ID']: string;
};
export interface PhotoAttachment
	extends AttachmentTemplate<
		| 'filename'
		| 'thumbnailUrl'
		| 'previewUrl'
		| 'previewWidth'
		| 'previewHeight'
		| 'largePreviewUrl'
		| 'largePreviewWidth'
		| 'largePreviewHeight'
	> {
	type: 'photo';
}
export interface FileAttachment
	extends AttachmentTemplate<'filename' | 'url' | 'isMalicious' | 'contentType'> {
	type: 'file';
}
export interface VideoAttachment
	extends AttachmentTemplate<
		| 'filename'
		| 'previewUrl'
		| 'previewWidth'
		| 'previewHeight'
		| 'url'
		| 'width'
		| 'height'
		| 'duration'
		| 'videoType'
	> {
	type: 'video';
}

export type Attachment = PhotoAttachment | VideoAttachment | FileAttachment;
