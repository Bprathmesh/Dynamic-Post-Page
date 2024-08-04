import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Compressor from 'compressorjs';

const Post = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [ogImage, setOgImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const postRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      new Compressor(file, {
        quality: 0.6,
        success: (compressedFile) => {
          const reader = new FileReader();
          reader.onload = (e) => setImage(e.target.result);
          reader.readAsDataURL(compressedFile);
        }
      });
    }
  };

  const generateOgImage = async () => {
    if (postRef.current) {
      setIsLoading(true);
      const canvas = await html2canvas(postRef.current, {
        width: 1200,
        height: 630,
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      setOgImage(imgData);
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    const updateMetaTag = (property, content) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    if (ogImage) {
      updateMetaTag('og:image', ogImage);
    }

    const description = content.slice(0, 160);
    updateMetaTag('og:description', description);
    
    updateMetaTag('og:title', title);

    document.title = title;

    // Additional meta tags for improved SEO
    updateMetaTag('og:type', 'article');
    updateMetaTag('og:url', window.location.href);

  }, [ogImage, content, title]);

  return (
    <div className={`post-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="content-wrapper">
        <div className="post-form">
          <div className="form-header">
            <h2>Create Your Post</h2>
            <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle" aria-label="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="post-input"
            aria-label="Post title"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-textarea"
            aria-label="Post content"
          />
          <div className="tag-input">
            <input
              type="text"
              placeholder="Add tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              aria-label="Add tags"
            />
            <button onClick={addTag} aria-label="Add tag">Add Tag</button>
          </div>
          <div className="tags-container">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>×</button>
              </span>
            ))}
          </div>
          <input type="file" onChange={handleImageUpload} className="post-file-input" aria-label="Upload image" />
          <button onClick={generateOgImage} className="post-button" disabled={isLoading} aria-label="Generate OG Image">
            {isLoading ? 'Generating...' : 'Generate OG Image'}
          </button>
        </div>
        <div className="preview-section">
          <h3>Post Preview</h3>
          <div
            id="post"
            ref={postRef}
            className="post-content"
            aria-live="polite"
          >
            <h1 className="post-title">{title}</h1>
            <p className="post-text">{content.length > 100 ? content.slice(0, 100) + '...' : content}</p>
            {image && <img src={image} alt="Post" className="post-image" />}
            <div className="post-tags">
              {tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="post-branding">
              <span>YourBrand</span>
            </div>
          </div>
        </div>
      </div>
      {ogImage && (
        <div className="og-image-preview">
          <h3>Generated OG Image:</h3>
          <img src={ogImage} alt="OG" />
        </div>
      )}
      <style jsx>{`
        .post-container {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .dark-mode {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        .content-wrapper {
          display: flex;
          gap: 30px;
          flex-direction: column-reverse;
        }
        .post-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .preview-section {
          flex: 1;
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .mode-toggle {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .post-input, .post-textarea, .tag-input input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
          background-color: inherit;
          color: inherit;
        }
        .post-textarea {
          min-height: 120px;
        }
        .tag-input {
          display: flex;
          gap: 10px;
        }
        .tag-input input {
          flex-grow: 1;
        }
        .tag-input button, .post-button {
          padding: 12px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .post-button:disabled {
          background-color: #ccc;
        }
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tag {
          background-color: #e1e1e1;
          color: #333;
          padding: 5px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          font-size: 14px;
        }
        .dark-mode .tag {
          background-color: #4a4a4a;
          color: #ffffff;
        }
        .tag button {
          background: none;
          border: none;
          color: #666;
          margin-left: 5px;
          cursor: pointer;
        }
        .post-content {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 315px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f8f8f8;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .dark-mode .post-content {
          background-color: #333;
          border-color: #444;
        }
        .post-title {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .post-text {
          font-size: 16px;
          line-height: 1.5;
        }
        .post-image {
          margin-top: 10px;
          max-width: 100%;
          max-height: 200px;
          object-fit: cover;
        }
        .post-tags {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .post-branding {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: #aaa;
        }
        .dark-mode .post-branding {
          color: #888;
        }
        .og-image-preview {
          margin-top: 30px;
        }
        .og-image-preview img {
          max-width: 100%;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .content-wrapper {
            flex-direction: column;
          }
          .post-content {
            width: 100%;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Post;