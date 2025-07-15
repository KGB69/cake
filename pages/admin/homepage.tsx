import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNav/AdminNavigation';
import Head from 'next/head';
import { HomepageContent } from '@/types/homepage';
import styles from './Admin.module.css';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

export default function HomepageAdmin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [homepageContents, setHomepageContents] = useState<HomepageContent[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  
  // Form state
  const [currentContent, setCurrentContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: '',
    heroButtonLink: '',
    heroImage: '',
  });

  // Check if user is logged in as admin
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/admin');
    } else {
      fetchHomepageContents();
    }
  }, [router]);

  // Fetch all homepage content variants
  const fetchHomepageContents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/homepage', {
        headers: {
          'x-admin-token': 'admin-session-active'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch homepage contents');
      }
      
      const data = await res.json();
      setHomepageContents(data.content ? (Array.isArray(data.content) ? data.content : [data.content]) : []);
    } catch (error) {
      console.error('Error fetching homepage contents:', error);
      setError('Error loading homepage contents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setImagePreview(result);
      }
    };
    reader.readAsDataURL(file);

    // Upload the image
    try {
      setIsUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await res.json();
      setUploadedImage(data.fileUrl);
      setCurrentContent(prev => ({
        ...prev,
        heroImage: data.fileUrl
      }));
      
      setSuccess('Image uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentContent.heroImage) {
      setError('Please upload an image for the hero section');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch('/api/homepage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-session-active'
        },
        body: JSON.stringify(currentContent)
      });
      
      if (!res.ok) {
        throw new Error('Failed to create homepage content');
      }
      
      await fetchHomepageContents();
      
      // Reset form
      setCurrentContent({
        heroTitle: '',
        heroSubtitle: '',
        heroButtonText: '',
        heroButtonLink: '',
        heroImage: '',
      });
      setImagePreview('');
      setUploadedImage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setSuccess('Homepage content created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating homepage content:', error);
      setError('Error creating homepage content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch(`/api/homepage/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-session-active'
        },
        body: JSON.stringify({ action: 'setActive' })
      });
      
      if (!res.ok) {
        throw new Error('Failed to set content as active');
      }
      
      await fetchHomepageContents();
      
      setSuccess('Homepage content set as active');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error setting content as active:', error);
      setError('Error setting content as active');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setContentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch(`/api/homepage/${contentToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': 'admin-session-active'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete homepage content');
      }
      
      await fetchHomepageContents();
      
      setSuccess('Homepage content deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting homepage content:', error);
      setError(error instanceof Error ? error.message : 'Error deleting homepage content');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setContentToDelete(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    router.push('/admin');
  };

  return (
    <>
      <Head>
        <title>Homepage Management | Admin | Cakelandia</title>
      </Head>
      <div className={styles.adminContainer}>
        <header className={styles.adminHeader}>
          <h1>Homepage Admin</h1>
          <div className={styles.headerButtons}>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </header>
        
        <AdminNavigation />
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <div className={styles.adminContent}>
          <section className={styles.homepageForm}>
            <h2>Add New Hero Content</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="heroImage">Hero Image</label>
                <input
                  type="file"
                  id="heroImage"
                  name="heroImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Hero image preview" />
                  </div>
                )}
                <p className={styles.uploadNote}>
                  Recommended image size: 1920x1080px. Images will be resized if larger.
                </p>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="heroTitle">Hero Title</label>
                <input
                  type="text"
                  id="heroTitle"
                  name="heroTitle"
                  value={currentContent.heroTitle}
                  onChange={handleInputChange}
                  placeholder="Welcome to Cakelandia"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="heroSubtitle">Hero Subtitle</label>
                <input
                  type="text"
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={currentContent.heroSubtitle}
                  onChange={handleInputChange}
                  placeholder="Delicious pastries for every occasion"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="heroButtonText">Button Text</label>
                <input
                  type="text"
                  id="heroButtonText"
                  name="heroButtonText"
                  value={currentContent.heroButtonText}
                  onChange={handleInputChange}
                  placeholder="Shop Now"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="heroButtonLink">Button Link</label>
                <input
                  type="text"
                  id="heroButtonLink"
                  name="heroButtonLink"
                  value={currentContent.heroButtonLink}
                  onChange={handleInputChange}
                  placeholder="/products"
                  required
                />
              </div>
              
              <div className={styles.formButtons}>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={isLoading || isUploading || !uploadedImage}
                >
                  {isLoading || isUploading ? 
                    (isUploading ? 'Uploading Image...' : 'Saving...') : 
                    'Add Hero Content'}
                </button>
              </div>
            </form>
          </section>
          
          <section className={styles.homepageList}>
            <h2>Hero Content Variations</h2>
            {isLoading ? (
              <p>Loading hero contents...</p>
            ) : homepageContents.length === 0 ? (
              <p>No hero content found. Add your first one!</p>
            ) : (
              <div className={styles.heroVariationsList}>
                {homepageContents.map((content) => (
                  <div 
                    key={content.id} 
                    className={`${styles.heroVariation} ${content.isActive ? styles.activeVariation : ''}`}
                  >
                    <div className={styles.heroPreview}>
                      {content.heroImage ? (
                        <img 
                          src={content.heroImage} 
                          alt={content.heroTitle} 
                          className={styles.heroThumbnail}
                          onError={(e) => {
                            // Handle image loading errors
                            e.currentTarget.src = '/images/placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className={styles.noImage}>No Image</div>
                      )}
                    </div>
                    <div className={styles.heroInfo}>
                      <h3>{content.heroTitle}</h3>
                      <p className={styles.heroSubtitle}>{content.heroSubtitle}</p>
                      <p className={styles.heroButton}>Button: {content.heroButtonText}</p>
                      <p className={styles.heroLink}>Link: {content.heroButtonLink}</p>
                      <p className={styles.heroStatus}>
                        Status: <span className={content.isActive ? styles.activeStatus : styles.inactiveStatus}>
                          {content.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div className={styles.heroActions}>
                      {!content.isActive && (
                        <button 
                          className={styles.activateButton} 
                          onClick={() => handleSetActive(content.id)}
                          disabled={isLoading}
                        >
                          Set Active
                        </button>
                      )}
                      <button 
                        className={styles.deleteButton} 
                        onClick={() => openDeleteModal(content.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Hero Content"
        message="Are you sure you want to delete this hero content? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
