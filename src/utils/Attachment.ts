type AttachmentTemplate<T extends string> = {
	[key in T | 'ID']: string;
};
interface PhotoAttachment
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
interface FileAttachment
	extends AttachmentTemplate<'filename' | 'url' | 'isMalicious' | 'contentType'> {
	type: 'file';
}
interface VideoAttachment
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
