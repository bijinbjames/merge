import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from "../Loader/Loader";
import BookPreview from "../BookPreview/BookPreview";
import coverImg from "../../images/cover_not_found.jpg";
import "./BookDetails.css";
import { FaArrowLeft, FaStar, FaBook, FaUser, FaCalendarAlt, FaBuilding, FaLanguage, FaTags, FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    async function getBookDetails() {
      try {
        if (!id) {
          console.error("No book ID provided");
          setError("No book ID provided");
          setLoading(false);
          return;
        }

        console.log("Fetching details for book ID:", id);
        
        // Removed API key from URL for security
        const apiUrl = `https://www.googleapis.com/books/v1/volumes/${id}`;
        console.log("Fetching from:", apiUrl);
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
          console.error(`API request failed with status: ${response.status}`);
          throw new Error(`Failed to fetch book details: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Book details response:", data);

        if (data && data.volumeInfo) {
          const { volumeInfo } = data;
          const newBook = {
            description: volumeInfo.description || "No description found",
            title: volumeInfo.title || "Unknown title",
            cover_img: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || coverImg,
            author: volumeInfo.authors?.join(", ") || "No author found",
            published_date: volumeInfo.publishedDate || "No publish date found",
            publisher: volumeInfo.publisher || "No publisher found",
            categories: volumeInfo.categories?.join(", ") || "No categories found",
            pages: volumeInfo.pageCount || "Unknown pages",
            language: volumeInfo.language || "Unknown language",
            preview_link: volumeInfo.previewLink,
            rating: volumeInfo.averageRating,
            ratings_count: volumeInfo.ratingsCount
          };
          console.log("Processed book details:", newBook);
          setBook(newBook);
        } else {
          console.error("Invalid book data received");
          setError("Could not load book information");
          setBook(null);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
        setError(`Error loading book: ${error.message || "Unknown error"}`);
        setBook(null);
      } finally {
        setLoading(false);
      }
    }
    getBookDetails();
  }, [id]);

  const handleShowPreview = () => {
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <section className='book-details'>
        <div className='container'>
          <button type='button' className='flex flex-c back-btn' onClick={() => navigate("/")}>
            <FaArrowLeft size={22} />
            <span className='fs-18 fw-6'>Go Back</span>
          </button>
          <div className="error-message">
            <h2>Error Loading Book</h2>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='book-details'>
      <div className='backdrop-blur'></div>
      <div className='container'>
        <button type='button' className='flex flex-c back-btn' onClick={() => navigate("/")}>
          <FaArrowLeft size={22} />
          <span className='fs-18 fw-6'>Go Back</span>
        </button>

        {book ? (
          <div className='book-details-content grid'>
            <div className='book-details-img'>
              <img 
                src={book.cover_img} 
                alt={`${book.title} cover`}
                onError={(e) => {
                  console.log("Cover image load error");
                  e.target.onerror = null;
                  e.target.src = coverImg;
                }}
              />
              {book.rating && (
                <div className='book-rating'>
                  <span>{book.rating}</span>
                  <FaStar className="star-icon" />
                  <span className="ratings-count">({book.ratings_count})</span>
                </div>
              )}
            </div>
            <div className='book-details-info'>
              <div className='book-details-item title'>
                <h1 className='fw-6 fs-24'>{book.title}</h1>
              </div>
              <div className='book-details-item description'>
                <p>{book.description}</p>
              </div>
              <div className='book-details-meta'>
                <div className='book-details-item'>
                  <FaUser className="icon" />
                  <span className='fw-6'>Author: </span>
                  <span>{book.author}</span>
                </div>
                <div className='book-details-item'>
                  <FaCalendarAlt className="icon" />
                  <span className='fw-6'>Published: </span>
                  <span>{book.published_date}</span>
                </div>
                <div className='book-details-item'>
                  <FaBuilding className="icon" />
                  <span className='fw-6'>Publisher: </span>
                  <span>{book.publisher}</span>
                </div>
                <div className='book-details-item'>
                  <FaTags className="icon" />
                  <span className='fw-6'>Categories: </span>
                  <span>{book.categories}</span>
                </div>
                <div className='book-details-item'>
                  <FaBook className="icon" />
                  <span className='fw-6'>Pages: </span>
                  <span>{book.pages}</span>
                </div>
                <div className='book-details-item'>
                  <FaLanguage className="icon" />
                  <span className='fw-6'>Language: </span>
                  <span>{book.language}</span>
                </div>
              </div>
              {book.preview_link && (
                <div className='preview-link-container'>
                  <button onClick={handleShowPreview} className="preview-link">
                    <FaEye className="preview-icon" /> Preview Book
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="error-message">
            <h2>Book not found</h2>
            <p>Sorry, we couldn't find the book you're looking for.</p>
          </div>
        )}
      </div>

      {previewVisible && book && (
        <BookPreview 
          bookId={id}
          previewLink={book.preview_link}
          bookTitle={book.title}
          onClose={handleClosePreview}
        />
      )}
    </section>
  );
};

export default BookDetails;