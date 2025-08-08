'use client';

import FileInput from "@/components/FileInput";
import FormField from "@/components/FormField";
import { ChangeEvent, useState } from "react";

const Page = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
  })
  const [error, setError] = useState(null)

  const handleInputChange = (e: ChangeEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className='wrapper-md upload-page'>
      <h1>Upload a video</h1>
      {error && <div className="error-field">
          {error}
        </div>
      }

      <form className="rounded-20 gap-6 shadow-10 w-full flex flex-col px-5 py-6">
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

        <FileInput />
        <FileInput />
        
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
      </form>

    </div>
  )
}

export default Page
