'use client';

import FileInput from "@/components/FileInput";
import FormField from "@/components/FormField";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails } from "@/lib/actions/video";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const uploadFileToBunny = (file: File, uploadUrl: string, accessKey: string) => {
  return fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-type': file.type,
      AccessKey: accessKey,
    },
    body: file,
  }).then((response) => {
    if(!response.ok) throw new Error('Upload failed')
  })
}

const Page = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
  })
  const [videoDuration, setVideoDuration] = useState(0)

  const video = useFileInput(MAX_VIDEO_SIZE)
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE)

  useEffect(() => {
    if(video.duration !== null || 0) {
      setVideoDuration(video.duration)
    }
  }, [video.duration])


  const [error, setError] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      if(!video.file || !thumbnail.file) {
        setError('Please upload video and thumbnail')
        return;
      }

      if(!formData.title || !formData.description) {
        setError('Please fill in all the details')
        return;
      }

      // Upload the video to bunny
      const { videoId, uploadUrl: videoUploadUrl, accessKey: videoAccessKey } = await getVideoUploadUrl()

      if(!videoUploadUrl || !videoAccessKey) throw new Error('Failed to get video upload credentials')

      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      // Upload the thumbnail to DB
      const { uploadUrl: thumbnailUploadUrl, accessKey: thumbnailAccessKey, cdnUrl: thumbnailCdnUrl } = await getThumbnailUploadUrl(videoId)

      if(!thumbnailUploadUrl || !thumbnailAccessKey || !thumbnailCdnUrl) throw new Error('Failed to get thumbnail upload credentials')

      // Attach the thumbnail
      await uploadFileToBunny(thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey)

      // Create a new DB entry about the video details (urls, data)
      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCdnUrl,
        ...formData,
        duration: videoDuration
      })

      router.push(`/video/${videoId}`)

    } catch (error) {
      console.log(`Error submitting form: ${error}`);
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className='wrapper-md upload-page'>
      <h1>Upload a video</h1>
      {error && <div className="error-field">
          {error}
        </div>
      }

      <form className="rounded-20 gap-6 shadow-10 w-full flex flex-col px-5 py-6" onSubmit={handleSubmit}>
        <FormField 
          id='title'
          label='Title'
          value={formData.title}
          placeholder='Enter the video title'
          onChange={handleInputChange}
        />
        <FormField 
          id='description'
          label='Description'
          value={formData.description}
          placeholder='Describe what this video is about'
          as="textarea"
          onChange={handleInputChange}
        />

        <FileInput
          id='video'
          label='Video'
          accept='video/*'
          file={video.file}
          previewUrl={video.previewUrl}
          inputRef={video.inputRef}
          onChange={video.handleFileChange}
          onReset={video.resetFile}
          type="video"
        />
        <FileInput
          id='thumbnail'
          label='Thumbnail'
          accept='image/*'
          file={thumbnail.file}
          previewUrl={thumbnail.previewUrl}
          inputRef={thumbnail.inputRef}
          onChange={thumbnail.handleFileChange}
          onReset={thumbnail.resetFile}
          type="image"
        />
        
        <FormField 
          id='visibility'
          label='Visibility'
          value={formData.visibility}
          placeholder='Select the visibility (Public or Private)'
          as="select"
          options={[
            { value: 'public', label: 'Public'},
            { value: 'private', label: 'Private'},
          ]}
          onChange={handleInputChange}
        />

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>

    </div>
  )
}

export default Page
