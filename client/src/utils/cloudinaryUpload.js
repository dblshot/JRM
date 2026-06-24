const CLOUD_NAME = 'dqivy8zb5';
const UPLOAD_PRESET = 'student_uploads';

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(data?.error?.message || 'Upload failed');
  }
  return data.secure_url;
}
